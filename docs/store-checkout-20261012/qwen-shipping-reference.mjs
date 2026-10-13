// Preserved Qwen proposal, OFFLINE REFERENCE ONLY; not imported or deployed.
// Production uses the existing authenticated CWS provider. No alternate provider enabled.
// shipping.mjs - Calculadora de Frete Multi-Provider
import { fail } from './errors.mjs';

export class ShippingCalculator {
  constructor(env) {
    this.env = env;
    this.providers = [];
    
    // Inicializa providers disponíveis
    if (env.CORREIOS_USERNAME && env.CORREIOS_PASSWORD) {
      this.providers.push(new CorreiosProvider(env));
    }
    
    if (env.MELHOR_ENVIO_TOKEN) {
      this.providers.push(new MelhorEnvioProvider(env));
    }
    
    if (env.FRENET_TOKEN) {
      this.providers.push(new FrenetProvider(env));
    }
  }

  async calculateQuote(originZip, destinationZip, packages) {
    const quotes = [];
    
    // Tenta todos os providers em paralelo
    const results = await Promise.allSettled(
      this.providers.map(provider => 
        provider.getQuotes(originZip, destinationZip, packages)
      )
    );
    
    // Coleta todas as cotações válidas
    for (const result of results) {
      if (result.status === 'fulfilled') {
        quotes.push(...result.value);
      }
    }
    
    if (quotes.length === 0) {
      fail('NO_SHIPPING_OPTIONS', 'Não foi possível calcular o frete para este CEP.', 422);
    }
    
    // Ordena por preço
    return quotes.sort((a, b) => a.price - b.price);
  }
}

// Provider dos Correios (API oficial)
class CorreiosProvider {
  constructor(env) {
    this.username = env.CORREIOS_USERNAME;
    this.password = env.CORREIOS_PASSWORD;
    this.contract = env.CORREIOS_CONTRACT;
    this.card = env.CORREIOS_POSTING_CARD;
  }

  async getQuotes(originZip, destinationZip, packages) {
    // Serviços dos Correios
    const services = [
      { code: '03140', name: 'Sedex', type: 'express' },
      { code: '04510', name: 'PAC', type: 'standard' },
      { code: '03204', name: 'Sedex 10', type: 'express' },
      { code: '03212', name: 'Sedex Hoje', type: 'express' }
    ];
    
    const quotes = [];
    
    for (const service of services) {
      try {
        const quote = await this.calculateService(
          service.code, 
          originZip, 
          destinationZip, 
          packages
        );
        
        if (quote) {
          quotes.push({
            id: `correios-${service.code}`,
            carrier: 'Correios',
            service: service.name,
            type: service.type,
            price: quote.price,
            deliveryTime: quote.deliveryTime,
            description: `${service.name} - ${quote.deliveryTime} dias úteis`
          });
        }
      } catch (error) {
        // Ignora serviços indisponíveis
        console.warn(`Correios ${service.name} indisponível:`, error.message);
      }
    }
    
    return quotes;
  }

  async calculateService(serviceCode, originZip, destinationZip, packages) {
    const origin = originZip.replace(/\D/g, '');
    const destination = destinationZip.replace(/\D/g, '');
    
    // Calcula dimensões totais do pacote
    const totalWeight = packages.reduce((sum, pkg) => sum + (pkg.weight * pkg.quantity), 0);
    const maxLength = Math.max(...packages.map(p => p.length));
    const maxWidth = Math.max(...packages.map(p => p.width));
    const totalHeight = packages.reduce((sum, pkg) => sum + (pkg.height * pkg.quantity), 0);
    
    // API dos Correios (endpoint SOAP/XML)
    const url = new URL('https://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx/CalcPrecoPrazo');
    url.searchParams.set('nCdEmpresa', this.contract || '');
    url.searchParams.set('sDsSenha', this.password || '');
    url.searchParams.set('nCdServico', serviceCode);
    url.searchParams.set('sCepOrigem', origin);
    url.searchParams.set('sCepDestino', destination);
    url.searchParams.set('nVlPeso', (totalWeight / 1000).toFixed(2)); // kg
    url.searchParams.set('nCdFormato', '1'); // caixa
    url.searchParams.set('nVlComprimento', maxLength);
    url.searchParams.set('nVlAltura', totalHeight);
    url.searchParams.set('nVlLargura', maxWidth);
    url.searchParams.set('nVlDiametro', '0');
    url.searchParams.set('sCdMaoPropria', 'N');
    url.searchParams.set('nVlValorDeclarado', '0');
    url.searchParams.set('sCdAvisoRecebimento', 'N');
    url.searchParams.set('sDtCalculo', new Date().toISOString().split('T')[0]);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/xml'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      throw new Error(`Correios API error: ${response.status}`);
    }
    
    const xml = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    
    const error = doc.querySelector('Erro');
    if (error && error.textContent !== '0') {
      throw new Error(`Correios error code: ${error.textContent}`);
    }
    
    const price = parseFloat(doc.querySelector('Valor')?.textContent?.replace(',', '.') || '0');
    const deliveryTime = parseInt(doc.querySelector('PrazoEntrega')?.textContent || '0');
    
    if (price <= 0 || deliveryTime <= 0) {
      throw new Error('Invalid quote from Correios');
    }
    
    return { price, deliveryTime };
  }
}

// Provider Melhor Envio (API REST)
class MelhorEnvioProvider {
  constructor(env) {
    this.token = env.MELHOR_ENVIOR_TOKEN;
    this.baseUrl = env.MELHOR_ENVIO_SANDBOX === 'true' 
      ? 'https://sandbox.melhorenvio.com.br/api/v2'
      : 'https://melhorenvio.com.br/api/v2';
  }

  async getQuotes(originZip, destinationZip, packages) {
    const products = packages.map(pkg => ({
      from: {
        postal_code: originZip
      },
      to: {
        postal_code: destinationZip
      },
      products: [{
        id: pkg.sku,
        width: pkg.width,
        height: pkg.height,
        length: pkg.length,
        weight: pkg.weight / 1000, // kg
        insurance_value: pkg.declaredValue || 0,
        quantity: pkg.quantity
      }],
      options: {
        insurance_value: pkg.declaredValue || 0,
        receipt: false,
        own_hand: false
      }
    }));

    const response = await fetch(`${this.baseUrl}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ products }),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`Melhor Envio API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.map(quote => ({
      id: `melhorenvio-${quote.id}`,
      carrier: quote.company?.name || 'Melhor Envio',
      service: quote.name,
      type: quote.type || 'standard',
      price: quote.price,
      deliveryTime: quote.delivery_time,
      description: `${quote.company?.name} - ${quote.name} - ${quote.delivery_time} dias úteis`
    }));
  }
}

// Provider Frenet (API REST)
class FrenetProvider {
  constructor(env) {
    this.token = env.FRENET_TOKEN;
  }

  async getQuotes(originZip, destinationZip, packages) {
    const totalWeight = packages.reduce((sum, pkg) => sum + (pkg.weight * pkg.quantity), 0);
    const maxLength = Math.max(...packages.map(p => p.length));
    const maxWidth = Math.max(...packages.map(p => p.width));
    const totalHeight = packages.reduce((sum, pkg) => sum + (pkg.height * pkg.quantity), 0);

    const body = {
      sellerPostcode: originZip,
      recipientPostcode: destinationZip,
      shipmentInvoiceValue: packages.reduce((sum, pkg) => sum + ((pkg.declaredValue || 0) * pkg.quantity), 0),
      shippingServiceCode: null,
      shippingItemDimensions: {
        weight: totalWeight / 1000,
        length: maxLength,
        height: totalHeight,
        width: maxWidth
      }
    };

    const response = await fetch('https://api.frenet.com.br/shipping/quote', {
      method: 'POST',
      headers: {
        'Authorization': this.token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`Frenet API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.ShippingSevicesArray?.map(quote => ({
      id: `frenet-${quote.ServiceCode}`,
      carrier: quote.Carrier,
      service: quote.ServiceDescription,
      type: quote.ServiceType || 'standard',
      price: quote.ShippingPrice,
      deliveryTime: quote.DeliveryTime,
      description: `${quote.Carrier} - ${quote.ServiceDescription} - ${quote.DeliveryTime} dias úteis`
    })) || [];
  }
}

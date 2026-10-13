export class StoreError extends Error { constructor(code,message,status=400,details){super(message);this.code=code;this.status=status;this.details=details;} }
export const fail=(code,message,status=400,details)=>{throw new StoreError(code,message,status,details);};
export function cents(value){const n=Number(String(value).replace(',','.'));if(!Number.isFinite(n)||n<0)fail('INVALID_AMOUNT','Valor inválido.');return Math.round(n*100);}
export const zip=value=>{const s=String(value||'').replace(/\D/g,'');if(!/^\d{8}$/.test(s)||s==='00000000')fail('INVALID_ZIP','Informe um CEP válido com oito dígitos.');return s;};

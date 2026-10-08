import gzip,json,html,re,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[4];out=root/'docs/desafios-passport-43/completion/recovery-20261008';M=json.loads(gzip.decompress((out/'native-quizzes.json.gz').read_bytes()));V=lambda x:list(x.values()) if isinstance(x,dict) else x
TITLES={
'1070':'Quiz Wacken Open Air','1077':'Quiz: barbas dos rockstars','991':'Quiz MTV Unplugged','1009':'Quiz: qual álbum é mais antigo?','970':'Quiz dos anos 70','786':'Qual stream da RADIO BOB! combina com você?','770':'Quanto você conhece do rock dos anos 90?','761':'Quiz XXL do rock: uma viagem pela história do rock','755':'Este rockstar seria seu parceiro perfeito de quarentena!','725':'Quanto você é pesado de verdade?','719':'Quiz: rock ou não?',
'449':'Vestibular do rock','231':'De qual banda é este músico?','1029':'Quiz das turnês','923':'Quiz medieval','687':'Você reconhece estes logos de bandas?','654':'QUIZ: quanto punk existe em você?','642':'Quanto você conhece das letras de Bruce Springsteen?','616':'Você sabe como estas bandas se chamavam antes?','602':'Qual música agita seu verão?','520':'Quiz de emojis da BOB: você reconhece estas músicas?','489':'Quais versos seriam suas últimas palavras?','477':'Quiz AC/DC: quanto você conhece dos roqueiros?','475':'Qual festival você deveria visitar?','471':'Você reconhece estes roqueiros pelo cabelo?','423':'Você reconhece estes álbuns pela capa?','417':'Quanto você conhece de classic rock?','409':'Qual é seu QI do rock?','957':'Você conhece os nomes verdadeiros dos rockstars?','387':'Qual é sua idade musical?','379':'Você consegue completar estas letras?','373':'Quanto você conhece do rock dos anos 80?','371':'Qual música de rock combina com sua personalidade?','345':'Você reconhece estes videoclipes de rock?','323':'Você conhece os animais de estimação dos rockstars?','315':'Quem foi? Você conhece as histórias dos rockstars?','306':'Quem escreve a música que combina com sua vida?','298':'Qual roqueiro é seu melhor amigo?','290':'Quem disse isso?','282':'Quanto você conhece dos apelidos dos roqueiros?','278':'Qual é seu lugar em uma banda?','226':'Qual gênero do rock combina com seu jeito?','208':'Quanto você conhece das letras?','141':'Qual rockstar existe em você?','807':'Qual cachorro pertence a qual rockstar?'}
IDS={'226':12,'616':13,'208':14,'489':15,'654':16,'475':17,'477':18,'379':19,'687':20,'642':21,'602':22,'520':23,'1029':24,'417':25,'923':26,'807':27,'471':28,'231':29,'449':30,'423':31,'409':32,'345':33,'387':34,'278':35,'957':36,'315':37,'306':38,'298':39,'290':40,'282':41,'371':42,'141':43,'373':44,'323':45}
Q={}; A={}; R={}; D={}; H={}
def block(id,s):Q[id]=s.strip().split('\n')
def amap(s):
 for line in s.strip().split('\n'):
  if line: k,v=line.split('|',1);A[k]=v
COMMON={'Wahr':'Verdadeiro','Falsch':'Falso','Ja':'Sim','Nein':'Não','Ja!':'Sim!','Nein!':'Não!','Vielleicht':'Talvez','Richtig':'Verdadeiro','Falsch!':'Falso!','Weiß nicht':'Não sei','Keine Ahnung':'Não faço ideia','Genfersee':'Lago de Genebra','Bodensee':'Lago de Constança','Gardasee':'Lago de Garda','Chiemsee':'Lago Chiemsee'}
block('449','''Geografia — Qual banda tocou nos sete continentes no período de um ano?
Deep Purple escreveu “Smoke on the Water” depois de ver a fumaça de um incêndio sobre um lago. Em qual lago eles estavam?
Inglês — Qual música é sempre mal interpretada? Na verdade, ela fala de um perseguidor, sem nada de romântico.
Alemão — O que acontece com o oitavo Jägermeister na música “10 kleine Jägermeister”, do Die Toten Hosen?
História — Quando Brian Johnson fez seu primeiro show como novo vocalista do AC/DC?
História — Qual banda abriu o show do Live Aid em 1985?
Matemática — Por que a banda se chamou Sum 41?
Física — Qual é o título da tese de doutorado de Brian May em astrofísica?
Arte — Para que Kurt Cobain desenhou originalmente o sorriso do Nirvana? Só depois ele virou, sem intenção, o logo icônico da banda.
Música — Cordas vocais normais produzem oscilações entre 5,4 e 6,9 hertz por segundo. O que havia de especial na voz de Freddie Mercury?
Educação física — Quantos quilômetros Mick Jagger percorre no palco em uma noite normal de show?
Política — Qual tema político é abordado em “Sunday Bloody Sunday”, do U2?
Química — Qual dupla do rock recebeu o apelido “Toxic Twins” por causa do consumo excessivo de drogas?
Biologia — Heteropoda davidbowie é uma espécie de aranha-caçadora batizada em homenagem a David Bowie. O que ela tem de especial?
Religião — Qual acontecimento inspirou Billie Joe Armstrong a escrever “East Jesus Nowhere”?''')
amap('''91m24|Ele precisou morrer para deixar uma herança
wg1y1|Ele disputou quem bebia mais com os outros
yfdce|Ele foi para Colônia; os outros, para Düsseldorf
k46mr|O marido apareceu durante seu encontro
u9o6w|29 de junho de 1980
7nw0k|11 de janeiro de 1981
wl8lu|17 de abril de 1980
6i0r3|20 de julho de 1980
90nbk|Já haviam passado 41 dias do verão — Sum 41 é a abreviação de 41 Days of Summer
d3hi9|Faltavam apenas 41 dias para o verão — Sum 41 é a abreviação de 41 Days ’til Summer
gl937|Era a soma do dinheiro que os integrantes tinham nos bolsos quando escolheram o nome: 41 dólares
um0sx|Era a soma das idades dos integrantes fundadores naquela época
i2e72|Radiação eletromagnética dos corpos celestes
sdc5y|Uma investigação da velocidade radial das nuvens de poeira interplanetária
7epvy|Características dos universos em expansão
miz1d|Influência da dissipação no efeito Landau-Zener
uxz36|Para o cenário de um videoclipe
ixitl|No lugar de sua assinatura, porque tinha preguiça de assinar
3x3qq|Para o panfleto da festa de lançamento de Nevermind
s9r1t|Para o primeiro pôster da banda
f5q99|Suas oscilações chegavam a 7,04 hertz por segundo. Ele aproveitava sua extensão vocal muito melhor que os outros.
y51sn|Nada. Tecnicamente, sua voz era perfeitamente normal. Tudo isso é apenas um mito.
oi26w|Sua extensão vocal abrangia quatro oitavas, permitindo alcançar notas que ninguém mais conseguia.
5qt8d|Suas oscilações ficavam abaixo da média — isso tornava sua voz especial.
bs8j4|Cerca de 5 quilômetros
2153l|Cerca de 12,5 quilômetros
1bkzi|Cerca de 19 quilômetros
3lyoq|Cerca de 23 quilômetros
9uwql|A Guerra dos Trinta Anos
lss6k|Os conflitos durante a questão da Irlanda do Norte
yn895|A Guerra de Independência da Escócia
5bxff|A Guerra da Sucessão Espanhola
5unhl|Ela consegue mudar sua cor para tons muito vivos
ge5hj|Ela tem um raio na parte traseira, como o desenho da aranha-de-cruz
 dylwx|Ela tem pelos longos e de cor laranja-clara
p5ert|Ela emite sons semelhantes a canto para atrair presas para a teia com ondas sonoras
u0uhb|O funeral de um grande amigo
o1hz0|Ele foi convidado para um batizado
28ctr|O casamento de seu primo
8ck4u|Quando criança, precisava acompanhar os avós à igreja todos os domingos'''.replace('\n dylwx','\ndylwx'))
block('231','''Em qual banda Keith Richards toca?
Malcolm Young foi integrante de qual banda?
De qual banda Joe Perry faz parte?
Em qual banda Steve Harris toca?
Este músico se chama Andreas Meurer e toca em qual banda?
Krist Novoselic foi o baixista de qual banda?
Em qual banda Taylor Hawkins toca?
Lemmy Kilmister foi o vocalista de qual banda?
De qual banda Mike Dirnt faz parte?
Em qual destas bandas Rod Gonzalez toca?
Simon Neil toca em qual banda?
Rob Trujillo é integrante de qual banda?''')
block('1029','''Qual banda foi a primeira a fazer shows nos sete continentes em um único ano?
Quem faturou mais em uma única turnê?
Quando Van Halen se apresentava, fazia um pedido muito curioso aos organizadores. Qual?
Os Rolling Stones também detêm um recorde com a “Voodoo Lounge Tour”!
Ao encontrar um cartaz escrito “Die Roten Rosen”, vale a pena parar. Quem provavelmente está por trás desse nome?
Os Rolling Stones são uma das bandas de rock há mais tempo em atividade e continuam na estrada. Quando fizeram seu primeiro show?
Rod Stewart entrou no Guinness com o maior show gratuito de todos os tempos. Quantos espectadores compareceram?
Todo começo é difícil. No lugar de hotéis e comida de primeira, muitos roqueiros começam com uma van velha e enferrujada, sem nem ter o que comer direito. O que Guns N’ Roses roubou para não passar fome na primeira turnê?
Uma música acompanha o Iron Maiden nas turnês há muito tempo. Ela toca ao fim da troca de palco, depois da banda de abertura. Qual?
Na “Book of Souls Tour”, em 2016, o avião do Iron Maiden, o Boeing 747 “Ed Force One”, chamou a atenção do mundo. Por quê?
Sempre há alguma perda pelo caminho. O que Liam Gallagher perdeu durante uma das últimas turnês do Oasis, em 2002?
Às vezes, animais também saem em turnê. O ZZ Top levou isso longe: quais animais acompanharam sua “Worldwide Texas Tour” nos anos 70?
Na turnê mundial do Black Sabbath, em 1978, Ozzy Osbourne foi procurado pela polícia, anunciado no rádio e na televisão, e a banda não pôde tocar. O que aconteceu?
No início dos anos 90, Billy Idol foi retirado de um lugar por soldados. Por quê?
Logo no início da carreira, The Who perdeu o direito de se hospedar em hotéis Holiday Inn. Qual foi o motivo?
As turnês das grandes bandas cresceram muito em relação ao passado. Quantos caminhões teriam acompanhado os Rolling Stones na “No Filter Tour”, em 2017?''')
amap('''pt9ie|Todos os M&M’s marrons precisavam ser retirados dos pacotes
r178k|Precisava haver uma foto de Elvis Presley nos bastidores
gg13x|Meia hora antes da chegada da banda, uísque com Coca-Cola precisava estar misturado na proporção exata de 1 para 3
z3os8|Os ingressos com maior preço médio
ttthv|O maior número de espectadores de shows em um ano
xdenm|O maior palco móvel do mundo
n0g1s|12 de julho de 1962
g9bwh|16 de agosto de 1977
cv2w5|19 de fevereiro de 1957
tz3al|Restos de comida nas bandejas do McDonald’s
fsc4o|Cebolas dos campos à beira da estrada
p4ebl|A comida das bandas que tocavam antes deles
sgqkl|Uma tempestade colocou o avião em grandes dificuldades e ele quase caiu!
4wmwl|Ao pousar no aeroporto de Stuttgart, o enorme avião da banda era muito maior que os aviões oficiais de Angela Merkel e do então presidente francês François Hollande.
1avh3|Ao entrar no espaço aéreo errado, o Iron Maiden recebeu uma escolta involuntária de caças.
t27pl|Alguns dentes, depois de uma briga em Munique.
g357y|Seu relógio Rolex, que ele jogou na cabeça do irmão durante uma discussão.
pkiza|Uma de suas guitarras favoritas, roubada da bagagem por um fã radical do Blur.
k6vr2|Tatus e gambás presos às guitarras em gaiolas especiais.
fppqx|Uma matilha inteira de coiotes, que deveria correr pelo palco e pela plateia.
e3k5d|Um bisão adulto, um touro Texas Longhorn, abutres e cascavéis.
fug0t|Ele deveria ser preso por atentado ao pudor, depois de urinar em uma estátua famosa.
7d7be|Ele simplesmente desapareceu e ninguém sabia onde estava. Passou mais de um dia sem dar sinal de vida.
06ekz|Fundamentalistas cristãos pediram protestos violentos contra o satanista, e ele precisou de proteção policial.
saxw1|Um ditador de um país vizinho queria um show particular.
s5mf6|Ele estava sendo procurado por um mandado de prisão internacional.
g85e4|Os funcionários do hotel queriam se livrar dele e não sabiam mais o que fazer.
2vxg0|Eles já eram conhecidos, mas nunca tinham dinheiro. Por isso, fugiam discretamente na noite anterior à saída.
iaq7w|Ao comemorar seu aniversário em um Holiday Inn em Michigan, Keith Moon dirigiu um Rolls-Royce para dentro da piscina do hotel.
xftrz|Insatisfeitos com uma hospedagem, tiraram todos os móveis dos quartos e atearam fogo neles no pátio do hotel.''')
D['1029']=['''Ninguém menos que Metallica detém o recorde! Com um show na Antártida em 8 de dezembro de 2013, James Hetfield e companhia conseguiram estabelecer essa marca.''', '''A “Farewell Yellow Brick Tour”, de Elton John, arrecadou 817,9 milhões de dólares com 278 shows até o início de 2023. Segundo o Billboard Boxscore, ela se tornou a turnê mais bem-sucedida de todos os tempos. Naquele momento, Elton John estava em primeiro lugar, à frente de Ed Sheeran, com 776,4 milhões de dólares, e U2, com 736,4 milhões.''', '''A resposta é: separar os M&M’s! O pedido tinha um motivo sério: se o organizador o cumprisse, ou ao menos discutisse o assunto, Van Halen poderia presumir que o rider da turnê havia sido lido. Isso era especialmente importante para a segurança, porque a banda tinha uma estrutura de palco enorme em comparação com outros grupos da época, e um palco já havia cedido sob ela. Esses detalhes precisavam ser tratados antes; os M&M’s serviam para verificar isso.''', '''O maior número de espectadores! Mick Jagger, Keith Richards e seus colegas reuniram números impressionantes em um ano: em 12 meses, mais de 5,7 milhões de pessoas assistiram a 122 shows!''', '''Provavelmente não foi tão difícil! É o pseudônimo do Die Toten Hosen, que já fez shows secretos com esse nome. Outra curiosidade: foi assim que a banda conquistou seu primeiro sucesso nas paradas, com um disco de covers que misturava punk alemão e schlager e chegou ao 21º lugar nas paradas locais.''', '''Isso mesmo: Keith Richards e seus colegas estão na estrada há mais de 60 anos! Já 19 de fevereiro de 1957 é o aniversário de Johann Hölzel, mais conhecido como Falco, e 16 de agosto de 1977 é a data da morte de Elvis Presley.''', '''Oficialmente, com mais de 4,2 milhões de pessoas na Copacabana, ele é considerado o maior show de todos os tempos. Depois, surgiram dúvidas sobre quantos espectadores foram à praia do Rio por Rod Stewart e quantos estavam ali pelos fogos do réveillon.''', '''A van da banda quebrou a caminho dos primeiros shows em Seattle. Eles precisaram fazer as mil milhas restantes de carona e se alimentaram de cebolas cruas à beira da estrada. A experiência os uniu ainda mais: “Naquele momento, simplesmente soubemos que éramos uma banda. Estávamos prontos para agitar Los Angeles”, recorda Duff McKagan. Para Slash, olhando para trás, aquela viagem colocou em movimento tudo que viria depois.''', '''Quando a banda de abertura termina, toca “Doctor, Doctor”, do UFO, grupo do vocalista Phil Mogg. Michael Schenker, então integrante do UFO, escreveu a música com Mogg.''', '''As lendas britânicas do metal sempre chegaram ao destino e nunca precisaram fugir de caças. Quando seu enorme Boeing 747-400 pousou em Zurique em 1º de junho de 2016, viralizou uma foto com dois outros aviões “minúsculos” diante dele. Eram os aviões oficiais da então chanceler alemã Angela Merkel e do então governante francês François Hollande, que viajavam para a inauguração do túnel de base de São Gotardo. Na comparação de tamanho, Bruce Dickinson e seus companheiros ganharam claramente: Up the Irons!''', '''Dois dentes incisivos não voltaram com ele para o Reino Unido depois de uma confusão no Münchner Hof, em Munique. Ele brigou com outros cinco homens e, naturalmente, com seu irmão Noel. A luta percorreu o hotel, do porão ao saguão, até que as equipes de dez viaturas conseguiram acalmar a situação. Os Gallagher e companhia acabaram na cadeia.''', '''Billy Gibbons, Dusty Hill e Frank Beard queriam representar seu Texas natal e decidiram levar bisão, touro e cascavéis! Além do enorme trabalho, o trio viveu uma experiência especial. Gibbons contou: “Aprendemos que é possível retirar o veneno de uma cascavel, mas ele se forma novamente em poucos dias.”''', '''Simples como Ozzy: depois de beber rapidamente uma garrafa de álcool, o Príncipe das Trevas dormiu por mais de 24 horas. Os colegas só encontraram sua bagagem intocada no quarto e avisaram a polícia e a televisão. Depois do show de Van Halen, precisaram pedir desculpas e cancelar o show de Atlanta. Parecia que a cidade inteira procurava o rockstar desaparecido. Ele estava perto: entrou no quarto errado do hotel e ninguém o encontrou. Segundo os relatos, dormiu um dia inteiro. Quando acordou e ligou para os colegas, achava que só havia dormido bem e perguntou quando sairiam para o local do show.''', '''O roqueiro de cabelo descolorido foi retirado à força do hotel. Em três semanas de férias e festas, causou mais de 100 mil dólares em danos no quarto e se recusou a ir embora. Idol acabou sedado e foi carregado para fora em uma maca.''', '''Keith Moon não ganhou o apelido “The Loon” por acaso. De vez em quando, o baterista do The Who perdia completamente o controle e podia ter a ideia de afundar um carro de luxo. Como era de esperar, os donos do hotel não gostaram.''', '''É difícil acreditar: 250 caminhões transportavam tudo que precisava acompanhar a banda.''']
block('923','''Onde você mais gosta de ficar nos shows?
Qual tipo descreve melhor você quando vai a um show?
Qual é seu traje habitual?
As palavras trombeta marinha, saltério ou órgão portativo dizem alguma coisa para você?
Como você descreveria seu talento musical?
Você quer organizar uma grande festa com outras pessoas. Em qual papel você se imagina?
Como você decide a quais shows vai?''')
amap('''857l3|Bem na frente: eu também quero ver o artista!
88vof|No meio, onde tudo acontece! Mosh, mosh, mosh…
7rc11|Atrás: quero aproveitar a música completamente, sem aperto nem distrações!
smiob|Eu sempre canto junto bem alto!
umnx3|Primeiro vou ao bar buscar cerveja. Depois estou pronto para tudo.
sgy39|Faço amizade facilmente e converso com todo mundo, conhecido ou desconhecido.
t47as|Botas resistentes, jeans e uma boa jaqueta. Nada pode me atingir.
0ukoo|Não importa o tempo: bermuda e uma camiseta velha de banda! Isso basta e resiste a banhos de cerveja.
ng1j4|Eu me arrumo um pouco. Cabelo em ordem e roupa mais elegante. Assim, não importa quem encontro na rua!
91n2v|Tranquilo, conheço tudo isso!
egyxa|Alguma coisa me soa familiar, mas saber exatamente o que é tudo isso… difícil!
1dmi1|Não me venha com isso! Nunca estudei latim e, mesmo que tivesse, teria abandonado a matéria!
twmja|Leio partituras razoavelmente e acerto as notas quando me concentro. Não basta?
75mcg|Consigo tudo! Cantar, dançar e tocar instrumentos… Dê um pouco de tempo e vou impressionar você.
oszmv|Sabe como é… Deixo os outros na frente e prefiro ouvir.
hv11h|Cuido do bar. Atendimento é comigo e a noite nunca fica chata.
cwslk|Organizo compras, local e tudo mais. Na noite da festa, só quero conferir que tudo funciona e aproveitar.
8n43p|Sinceramente? Contribuo para o caixa, mas não quero estresse: só quero festejar.
oin80|Não importa quem toca, desde que eu tenha música ao vivo de novo nesta semana.
kr6w1|Tenho minhas bandas favoritas. Não importa a distância, preciso estar lá.
1nsqs|Tenho minha turma fixa e sempre saímos juntos. Nosso gosto musical parecido facilita ainda mais!''')
block('654','''Quem é chamado de “Godfather of Punk”?
Em que ano os Ramones foram formados?
Quando os Sex Pistols fizeram seu primeiro show?
Qual clube abriu em 1977 e deu palco às bandas punk?
Em que ano Die Ärzte e Die Toten Hosen foram formados?
O que aconteceu no primeiro show dos Sex Pistols?
Qual foi a primeira banda punk a entrar para o Rock and Roll Hall of Fame?
A capa de “London Calling”, do The Clash, foi inspirada em qual álbum?
Por que a turnê dos Sex Pistols prevista para 1976 foi cancelada?
Quem ficou bêbado no bar durante a inauguração do clube punk SO36, em Berlim?
Como a banda de Billie Joe Armstrong se chamava antes de virar Green Day?
Quantos shows os Ramones fizeram nos 22 anos em que estiveram em turnê?
O que significa “gobbing” na cena punk?
Qual banda fez o punk ressurgir nos anos 90?
Qual banda ficou muito conhecida na cena punk depois de tocar no Roxy Club em 1º de janeiro de 1977?''')
amap('''elsr3|Depois, os fãs ocuparam o local por vários dias
e72vm|Eles insultaram seus fãs
1m3yt|Eles destruíram tudo que estava no palco
0hxp1|Os integrantes não podiam tocar por causa de problemas com drogas
c1yje|Não encontraram lugares onde a banda pudesse se apresentar
cs5og|As autoridades estavam preocupadas com os jovens
hvkhb|2263 shows
0eung|1911 shows
1eoyg|3063 shows
gyknc|A banda cospe no público quando ele não se anima o suficiente
bki7h|O público cospe uns nos outros como uma espécie de mosh
ethet|O público cospe na banda durante os shows para demonstrar aprovação''')
block('642','''“A noite caiu, estou deitado acordado, consigo sentir que estou desaparecendo.”
“Fui falar com o homem da assistência aos veteranos, e ele disse: filho, você não entende?”
“É sábado à noite. Você está toda vestida de azul. Estou olhando você há algum tempo; talvez você também esteja olhando para mim.”
“Eu tinha oito anos e corria com uma moeda na mão até o ponto de ônibus para comprar um jornal para meu pai.”
“Só quero ser seu amante, não sou mentiroso.”
“Mary e eu nos conhecemos no colégio quando ela tinha apenas dezessete anos.”
“Quando olho nos seus olhos, é você, querida?”
“Correndo por nossas vidas à noite pelas ruas dos fundos.”
“A estrada está viva esta noite.”
“Esta noite, tudo é silêncio no mundo enquanto tomamos posição.”
“Ela ficou para baixo, mas nunca se prendeu; vai ficar tudo bem.”
“Você e eu éramos os que fingiam; deixamos tudo escapar.”
“Precisamos sair daqui enquanto somos jovens.”
“O que tenho, conquistei; o que não sou, aprendi.”
“Bancos de veludo amassado, sentado atrás, passeando pela rua.”''')
for id,x in M['616']['quiz']['questions'].items():
 COMMON[x['title']]='Como '+re.sub(r'^Wie hießen (?:die )?| früher\?$','',x['title'])+' se chamava antes?'
block('602','''O que refresca você em um dia quente de verão?
Você é do tipo:
Como você prefere passar as férias?
Qual é seu veículo de verão?
Qual bebida refresca você no verão?
Qual é a melhor parte do verão para você?
No verão, a janela do seu carro fica…
Qual é sua cor ao final do verão?
Qual foi seu melhor verão até agora?
Como você encerra uma noite de verão perfeita?''')
amap('''qp9ux|Uma cervejinha gelada
nr8zv|Um mergulho na piscina
qejay|Um bom passeio de moto
498sj|Adorador do sol
q6cls|Criatura da noite
1rtaw|Dançarino da chuva
mg7jr|Ouvindo música no jardim, sem sair da espreguiçadeira
ey8pb|Em festivais, festivais e mais festivais
hel3a|Nada melhor que férias à beira-mar
pg5oz|O carro com ar-condicionado
nwesi|A bicicleta arejada
8plce|A moto ao vento
ghbke|Cerveja bem gelada
fwqo3|Coquetéis refrescantes
oi6rk|Bastante água
wnqek|Festivais durante o verão inteiro!
yqf9e|Shows ao ar livre — pelo menos um por semana!
5uni5|Tirar férias e ouvir música com tranquilidade
lyf6b|Aberta e com a música no volume máximo
84eda|Fechada, com o ar-condicionado deixando tudo fresquinho
41gho|Vermelho-lagosta
zrt8p|Branco-farinha
grpcl|Bronzeado de férias
ppaqi|Um verão da minha juventude: naquela época, eles eram infinitos
xltud|O verão do ano que vem pode ser ainda melhor que os anteriores
x6aeb|Este verão está demais!
d1x70|Uma noite tranquila, com violão ao redor da fogueira
tgrb8|Cervejinha na mão no show da banda favorita
vjz0w|Churrasco na varanda com o melhor do rock no rádio''')
block('489','''Na sua opinião, quanto tempo uma música deve durar?
O que você faria na vida após a morte?
Qual música você mais espera ouvir em um show?
Qual banda toca no seu funeral?
Qual monumento do rock você gostaria de visitar?
Seus pensamentos são…
O que não pode faltar em uma música?
O que levaria você para debaixo da terra?
Você é:
Qual caminho você escolheria?''')
amap('''ppyz5|Bem longa: uma música boa deve durar pelo menos oito minutos
r5gcn|O padrão: de três a quatro minutos
durzg|No máximo dois minutos: músicas curtas vão direto ao ponto
4tp4t|Às vezes longa, às vezes curta. Uma música precisa sempre surpreender.
n06ny|Não acredito nisso: depois da morte, só quero que me deixem em paz
wejvm|Será uma enorme festa!
yndyr|Vou renascer como rockstar e agitar os palcos do mundo
kcpol|Vou continuar, sem dó, exatamente de onde parei nesta vida
wu8gs|Os bons e velhos sucessos da minha juventude
44tbb|As músicas novas, que devem ser muito boas
fh5q4|As baladas, para me perder na melancolia
g2tse|Tudo que seja alto, para cantar berrando e bater cabeça!
mn5gb|O Rainbow Bar & Grill, em Hollywood
cmcry|A estátua de Freddie Mercury, em Montreux
espil|Não faço esse tipo de coisa…
paatp|A AC/DC Lane, em Melbourne
yjrdl|Melancólicos
34kjr|No aqui e agora
1iikd|Bobos
sgwiv|Sérios
fvtzn|Algo experimental, que ninguém tentou antes
24phw|Toda música precisa de uma letra criativa e de uma boa mensagem
p5b0r|Guitarras, vozes roucas e volume!
7huju|Um bom riff de guitarra e um vocal de arrepiar são OBRIGATÓRIOS
nkqzq|O fim da minha banda favorita
nawv8|O aumento constante dos preços dos shows
o4vvh|Ir a uma festa de schlager
hssyt|Eu sobrevivo a tudo…
2lx0w|Uma figura excêntrica
s68kr|Um festeiro
hur23|Um sonhador
1qzva|Um sujeito durão
xb8hy|Um pensador inquieto
cp0ij|Um casca-grossa''')
block('477','''O que significa AC/DC?
Verdadeiro ou falso: durante a gravação de “Let There Be Rock”, o amplificador de Angus pegou fogo, mas ele terminou a gravação mesmo assim.
Do mais velho ao mais novo: qual é a ordem dos irmãos Young?
Quando o AC/DC foi formado?
Qual é o álbum mais vendido do AC/DC?
De onde veio a ideia para o nome da banda?
Quem substituiu Malcolm Young na guitarra em 2014?
Quando o AC/DC entrou para o Rock and Roll Hall of Fame?
Qual era o trabalho de Bon Scott antes de entrar na banda como vocalista?
Qual guitarra Angus Young toca?
Onde fica a AC/DC Lane?
Por que Brian Johnson interrompeu suas apresentações com a banda?
Verdadeiro ou falso: Bon Scott nasceu na Escócia, e os irmãos Young, na Irlanda.
Quais foram as últimas palavras de Bon Scott na última gravação com o AC/DC antes de morrer?
A quantos decibéis pode chegar um show do AC/DC? Para comparar: uma britadeira chega a 105 decibéis; um avião, a 140.
Quem tocou gaita de foles na gravação de “It’s a Long Way to the Top”?
Quando Brian Johnson se apresentou pela primeira vez como novo vocalista do AC/DC?
Qual ritual Bon Scott usava para manter suas cordas vocais em forma?
Quantas músicas do AC/DC têm a palavra “Rock” ou “Rockin’” no título?
Verdadeiro ou falso: Bon Scott prendia a franja com fita adesiva ao tomar banho para que ela não ficasse muito encaracolada.
Qual vocalista conhecido substituiu Brian Johnson na turnê de 2016 do AC/DC?
Como se chama o álbum mais recente do AC/DC, lançado em 2020?
Verdadeiro ou falso: Malcolm Young, que morreu em 2017, participou da composição de todas as músicas do álbum atual.
O que significa “Shot in the Dark”, expressão usada pelo AC/DC em seu novo single?
Incluindo o novo álbum, quantos discos de estúdio o AC/DC lançou?''')
amap('''zxn3o|Corrente contínua/corrente alternada
7296a|Corrente alternada/corrente contínua
fpk3g|Março/abril de 1972
5s9ss|Novembro/dezembro de 1973
622rk|Fevereiro/março de 1974
b9hin|No primeiro show da banda, que ainda não tinha nome oficial, alguns fusíveis queimaram. AC/DC estava escrito na caixa de energia, e escolheram esse nome.
3fuq7|Margaret, irmã de Angus e Malcolm, viu o símbolo AC/DC em uma máquina de costura e o mostrou aos irmãos porque o achou interessante.
oteow|Era o símbolo dos técnicos de som que cuidavam das primeiras gravações da banda.
mlg08|Seu irmão George Young
hy74r|Seu sobrinho Stevie Young
f94x0|10 de março de 2003
ppvky|15 de março de 2004
7enkt|11 de dezembro de 2002
ym8z7|Ele trabalhava como roadie, inclusive para o AC/DC.
hn3rl|Durante o dia, era músico de rua; à noite, trabalhava como garçom.
t8ca6|Era motorista, inclusive da então novata banda AC/DC.
zm09s|Uma discussão entre os integrantes fez Brian precisar de distância.
ehsn6|Ele queria uma pausa para se dedicar a outros projetos.
2xdrl|Sua voz estava quase destruída e ele estava quase surdo depois de tantos anos de turnês.
308uo|100 decibéis
cn9iu|130 decibéis
85gbb|160 decibéis
xhqci|29 de junho de 1980
bhu36|20 de julho de 1980
drh5t|19 de agosto de 1980
uq3jg|Exercícios vocais diários e aquecimento antes de cada show, com uma equipe própria de professores de canto.
o7pm1|Um uísque antes de cada apresentação mantinha a voz em forma.
oeve1|Ele gargarejava mel com vinho tinto todas as manhãs para cuidar das cordas vocais.
atuwv|Sair para caçar à noite
hd6zn|Aproveitar uma oportunidade inesperada
c1015|Responder com confiança a uma pergunta cuja resposta você não sabe''')
block('475','''Para começar: quando e como você chega?
Onde você passa o tempo no festival quando não está pulando no mosh diante de algum palco?
Do que você se alimenta?
Quais bandas você vai assistir?
Qual é sua roupa de festival?
A chuva…
Com quem você passa os dias do festival?
O que não pode faltar na sua bagagem?
Como é seu dia perfeito em um festival?
Para onde você vai?''')
amap('''hbkap|Reservo cedo e sou sempre o primeiro a chegar, claro, com o carro lotado até o teto.
y8y0t|Chego no último instante, usando transporte público.
eh97u|Naturalmente, chego pontualmente com meu trailer.
oac0i|Não me importo quando nem como chego. Alguém vai me levar.
mihpp|Na barraca do Green Camp: aproveito com pessoas parecidas e ainda faço algo pelo meio ambiente.
j4glr|O chão é meu quarto. Em qualquer lugar encontro um canto para relaxar e dormir.
5b2pz|Volto para casa à noite. Festival é bom, mas preciso do meu sono de beleza.
xovhw|Meu trailer tem espaço para deitar com a turma, mas quase não fico no acampamento: é hora de festa!
9fvh3|De cerveja. Do que mais seria?
kujsn|Só preciso da música!
8eo1o|Tenho comida suficiente guardada.
t0wvq|Pego tudo que consigo de graça.
3onfh|Só as que queria ver desde o começo. O resto não me interessa.
e6gyx|Todas as conhecidas e as poucas menores que me fizeram vir.
ycjd6|Tudo que consigo assistir: dá para descobrir muita coisa nova.
5pfo3|Que bandas? Fico bêbado no acampamento e nem lembro meu nome…
x839q|Camisetas de banda e bermuda
pk96r|Não importa a roupa: ela está sempre cheia de lama e sujeira
wmbbr|Uma roupa nova por dia. Dá para manter a boa aparência até em festival
g7zvs|Uma fantasia maluca de viking ou algo assim
wrcyp|…melhora tudo. Começa a guerra de lama!
6ehaj|…estraga tudo. Vou para casa!
sbqsp|…incomoda um pouco, mas eu aproveito mesmo assim.
0zy4t|…não me afeta, porque estou sempre preparado para tudo.
fx9jn|Vou sozinho. Sempre dá para conhecer gente legal.
ngemt|Vou com uma turma grande, mas geralmente nos separamos no festival.
dsugx|Vou com meus amigos e gostamos de ficar entre nós.
ayuvh|Vou com meu melhor amigo; juntos fazemos amizade em qualquer lugar.
rkom9|A churrasqueira
vfgfv|Cerveja, cerveja e, muito importante, cerveja!
ngqr3|Com certeza, botas de borracha
54z6v|Sem dúvida, camisinhas
dc5iy|Dormir bastante, tomar café com calma, passear pelo local e, à noite, curtir até cair.
c2bjc|Ficar o dia todo de bobeira e bebendo com os amigos no acampamento, depois ver nossas bandas favoritas.
steaz|Alterno entre dormir e festejar.
r3o4q|Não faço ideia. Nunca lembro dos melhores dias…
ujzvd|Norte
xznbp|Sul
o6nts|Leste
idid3|Oeste
huagn|Para uma boa festa, vou a qualquer lugar.''')
COMMON.update({'Zu welcher Band gehört dieses Logo?':'De qual banda é este logo?','Welchen Song suchen wir?':'Qual música estamos procurando?','Welchen Rocker suchen wir?':'Qual roqueiro estamos procurando?','Welches Album ist das?':'Qual é este álbum?','Welches Album ist das? ':'Qual é este álbum?','Wem gehört dieser Hund?':'De quem é este cachorro?'})
block('417','''De onde veio a inspiração para o famoso logo da língua dos Rolling Stones?
Qual banda não se separou em 1980?
Qual banda fez o primeiro show da história no Hyde Park, em Londres?
Quais músicas Brian Johnson cantou na seleção para ser o novo vocalista do AC/DC?
Qual destes integrantes do Queen recebeu a condecoração britânica CBE?
Qual banda recebeu o nome de um professor de seus tempos de escola?
Verdadeiro ou falso: antes da carreira no The Who, Roger Daltrey foi professor de escola primária.
Qual vocalista também é conhecido como “Demon of Screamin’”?
O nome Deep Purple foi inspirado em quê?
Qual destes três álbuns de estúdio dos Eagles foi lançado por último?
Com qual recorde Van Halen entrou para o Guinness em 1983?
Quantas vezes Bruce Springsteen repete a palavra “down” em “I’m Going Down”?
Depois de “Thriller”, de Michael Jackson, qual foi a música mais pedida na MTV?
Verdadeiro ou falso: em um show de Londres, as autoridades desligaram o microfone de Bruce Springsteen depois de três horas e meia.
“É só tirar aqueles discos antigos da prateleira” são as primeiras palavras de qual música?
Em qual banda Paul Stanley e Gene Simmons tocaram antes do Kiss?
Qual banda fez uma participação em “De Volta para o Futuro 3”?
Quando as palavras “Don’t Stop Believin’” aparecem pela primeira vez na música do Journey com esse nome?
Em qual destas bandas Eric Clapton não tocou?
Verdadeiro ou falso: quando Creedence Clearwater Revival fez um show na Rússia em 1977, cantou todas as músicas em russo.
Quem queria muito tirar John Bonham do Led Zeppelin para sua própria banda?''')
amap('''gdif0|Uma propaganda de chiclete
kqgk1|A deusa hindu da morte e da destruição, Kali
qutq4|Uma noite de festa selvagem com groupies
epnja|A cor roxa da pequena van usada para ir aos shows no começo da carreira
m440g|A cor do céu quando, voltando de uma festa, decidiram formar a banda
519ex|Uma música de Peter De Rose que a avó de Ritchie Blackmore sempre tocava para ele no piano
ynstq|Eles tiveram o maior público de um show de rock.
1as4t|Eles foram a banda mais bem paga.
q81po|Eles fizeram o show mais alto, com 139 decibéis.
cj0xs|73 vezes
uy1pm|97 vezes
664bq|81 vezes
jr7sc|Depois de 35 segundos
nlcay|Depois de 3 minutos e 21 segundos
77e99|Depois de 2 minutos e 54 segundos''')
block('409','''Qual roqueiro tem doutorado em astrofísica?
Quanto tempo dura um show de três horas de Bruce Springsteen?
Wacken é um festival. Todos os festivais têm rock. Portanto…
Qual banda ainda toca com sua formação original?
Quantos fãs de rock podem entrar em um espaço vazio de festival?
“Saindo da minha gaiola / E tenho passado muito bem / Preciso, preciso me controlar.” Como a letra continua?
Queen se escreve com “Q” no começo e “h” no fim. Está certo?
Qual banda fez seu primeiro show com o nome “Tony Flow And The Miraculously Majestic Masters Of Mayhem”?
Complete: guitarrista — amplificador; vocalista — ?
Qual roqueiro urinou na comida do diretor da escola quando era criança?
Três bandas fazem três shows em três horas. Quanto tempo cem bandas levam para fazer cem shows?
Uma banda tem cinco integrantes. Todos saem, exceto dois. Quantos integrantes continuam na banda?
Qual banda estamos procurando?
A mãe de Ozzy tem três filhos: Huguinho, Zezinho e ?
A mãe deste rockstar é a sogra da minha mãe. Quem é o rockstar?''')
amap('''mjmzb|Duas horas e meia
9op5k|Pouco mais de uma hora
i9hoa|Quatro horas
9crzi|Três horas
wx4jc|…Wacken acontece em agosto.
g5xkm|…Wacken é incrível.
gmhlw|…Wacken tem rock.
7fczw|…Wacken está esgotado.
s9z68|Um
8i2ts|Depende do espaço
iduum|Cerca de dez mil pessoas, em média
32ax3|Que se dane, desde que tenha cerveja para todo mundo!
3r6cx|“Porque eu sei tudo”
flovn|“Quando não consigo sentir o chão”
qh2hs|“Porque eu quero tudo”
euytp|“Para ver por onde passei”
s32zi|Sim.
fywt0|Hum… não faço ideia?
ktgbj|Em inglês, sim.
4y44w|Voz
hxbw6|Microfone
64prp|Guitarra
8drlp|Letra
xrqro|Uma semana
2ctrd|Cem horas
ipjpv|Três horas
eig0h|Três dias
9tyzy|Dois
f3qet|Nenhum
eos2c|Cinco
5f3yb|Todos
nonho|Luisinho
sf0ui|Hack
a728v|Tack
z5n6s|Meu avô
bmubu|Meu pai''')
block('957','''Quem está por trás do nome artístico Alice Cooper?
Com qual nome William Michael Albert Broad faz música?
Qual é o nome verdadeiro de Farin Urlaub?
Qual rockstar condecorado se chama Paul David Hewson, KBE?
Todo mundo conhece Meat Loaf, mas qual é seu nome verdadeiro?
Quem nasceu Frank Carlton Serafino Feranna?
Qual musicista usa o nome P!nk?
Com qual nome Saul Hudson é conhecido?
Qual destes músicos se chama Dirk Albert Felsenheimer na vida real?
Qual é o nome de nascimento de Steven Tyler?
Qual nome Jeffry Ross Hyman adotou, incluindo nele o nome de sua banda?
The Edge é um nome artístico! Como esse homem se chama de verdade?
Com qual nome Farrokh Bulsara entrou para a história da música?
“The Artist Formerly Known As Prince” nasceu com qual nome?
Qual nome David Robert Jones adotou ao completar dezoito anos?
Qual é o nome verdadeiro de Campino, sem o nome artístico?
Como todos chamam Ian Fraser Kilmister?
Quem é conhecido como Flea, ou “pulga”, em português?''')
block('387','''O que você mais costuma fazer em um show?
Qual filme você mais gostaria de assistir?
Qual álbum ocupa o primeiro lugar na sua coleção?
Com qual música você consegue se soltar de verdade?
Como você mais gosta de ouvir música?
Qual rockstar é seu ídolo?
Qual jogo não pode faltar em uma noite de jogos?
Qual roupa você escolheria para um show?
A qual show lendário você gostaria de ter ido?
Qual separação de banda partiu seu coração?''')
amap('''86sav|Fico no bar da cerveja e aproveito o espetáculo de longe.
p1vbl|Grito todas as músicas na primeira fila até desmaiar.
y85r7|Primeiro, compro o equipamento certo na barraca de camisetas.
wah5o|Simplesmente danço até ficar completamente exausto.
m45u5|Tubarão — é preciso um pouco de suspense
k53as|O Senhor dos Anéis — difícil ser mais épico
jmlwo|Uma Babá Quase Perfeita — com certeza será engraçado
wc7xd|De Volta para o Futuro — é um clássico
k2ijo|No celular: escolha ilimitada, disponível em qualquer lugar
mo0gd|Discos e toca-discos: o ruído da agulha no vinil é maravilhoso
b0blu|Na fita cassete: sem avançar e rebobinar, faltaria alguma coisa
9vnfu|No CD player: prático para levar. Disco para viagem!
bg0r4|Trivial Pursuit — para também exercitar um pouco a cabeça
j238p|Risk — a mistura certa de estratégia e tensão
95mu3|PlayStation — escolhas infinitas e dá para jogar sozinho
5t5ht|Taboo — com certeza engraçado, e talvez constrangedor
 eyy3s|Camisa de flanela ou camiseta, cabelo sem arrumar: nada muito chamativo
0nfh3|Roupa chamativa, maquiagem e uma cabeleira selvagem: precisa ser extravagante
is6c9|Camiseta ou suéter com um jeans bem cuidado: simples, mas chama a atenção
2pfpe|É preciso um pouco mais de elegância: camisa ou vestido são obrigatórios
y6661|Queen no Live Aid
v61g4|Johnny Cash na prisão
4uhii|Metallica na Antártida
j2rn4|Nirvana no MTV Unplugged'''.replace('\n eyy3s','\neyy3s'))
block('373','''Depois da morte trágica de seu vocalista, esta banda lançou “Back in Black” como álbum de retorno.
Qual música de David Bowie marcou toda uma geração por meio do filme “Christiane F. — Wir Kinder vom Bahnhof Zoo”, lançado em 1981?
Quem são os Toxic Twins?
Qual capa mostra uma pessoa de jeans, camiseta branca e boné vermelho diante de uma bandeira americana?
Para qual filme Huey Lewis escreveu “The Power of Love”?
Quem teve a ideia de “Kickstart My Heart” depois de quase morrer de overdose?
Qual música é considerada o hino da queda do Muro de Berlim?
Qual banda foi formada em 1981 depois de seu baterista publicar o anúncio “Baterista procura outros músicos para tocar juntos”?
“Eye of the Tiger” faz parte da trilha de qual filme?
Este shock rocker se tornou inesquecível quando arrancou a cabeça de um morcego com uma mordida em um show de 1982.
Por que Kiss chamou tanta atenção em 1983?
Onde Queen fez sua apresentação mais lendária em 13 de julho de 1985?
Qual festival de hard rock e metal abriu as portas pela primeira vez em 1980, com Judas Priest, Scorpions e Rainbow como atrações principais?
Qual é o álbum de estreia mais bem-sucedido já lançado por uma banda de rock?
Quem lançou o primeiro e, até hoje, único single em alemão que chegou ao primeiro lugar nos Estados Unidos?
“Don’t You Forget About Me”, do Simple Minds, está na trilha de “The Breakfast Club”. Qual músico deveria originalmente gravar o sucesso, mas recusou?
Qual afirmação é verdadeira?
Quem ganhou o Oscar de melhor trilha musical em 1985?
Quantos álbuns Van Halen vendeu até hoje?
Qual videoclipe a Marinha dos Estados Unidos chamou de “o vídeo de recrutamento mais eficaz já produzido”?''')
amap('''d30op|De Volta para o Futuro
m8fm8|Gene Simmons tocou um solo de guitarra com sua língua extremamente longa.
klutm|Eles destruíram um quarto de hotel por tédio enquanto esperavam para tocar.
0kgxs|Eles apareceram na televisão sem maquiagem pela primeira vez.
xynco|No Live Aid, no estádio de Wembley, em Londres
o4dxt|No show de encerramento da “Magic Tour”, em Knebworth Park
vh7kn|Na gravação do filme-show “We Will Rock You”, em Montreal
a94xr|Die Toten Hosen com “Hier kommt Alex”
0ex51|Falco com “Rock Me Amadeus”
6iihy|Die Ärzte com “Westerland”
au0qf|Bryan Adams confirmou que “Summer of ’69” era apenas uma referência a uma prática sexual.
ii8pb|“Still Loving You”, do Scorpions, provocou um baby boom na França.
i7rg5|David Bowie e Queen se encontraram para comer e tiveram por acaso a ideia de “Under Pressure”.
88n1k|Prince com “Purple Rain”
68rpx|Van Halen com “1984”
5poug|Kenny Loggins com “Footloose”
enltg|80,3 milhões
pz84n|56,5 milhões
sfsjo|42,8 milhões''')
block('379','''Chances desperdiçadas / Nada é de graça / Saudade do que existia / Ainda é difícil / Difícil enxergar (The Kids Aren’t Alright — The Offspring)
Vivendo depois da meia-noite, curtindo até o amanhecer / Amando até de manhã / Depois eu vou embora / Eu vou embora / Tenho cromo brilhante / Aço refletindo (Living After Midnight — Judas Priest)
Ele é aquele que chamam de Dr. Feelgood / É quem faz você se sentir bem / É aquele que chamam de Dr. Feelgood (Dr. Feelgood — Mötley Crüe)
Herdeiros de uma guerra fria / Foi nisso que nos tornamos / Herdando problemas, minha mente está entorpecida / Louco, simplesmente não suporto (Crazy Train — Ozzy Osbourne)
Toda noite eu subia escondido / Nas costas da música / Encostava os ouvidos nas asas (Radio — Rammstein)
Ouça o tambor batendo fora do tempo / Outro manifestante ultrapassou o limite / Para encontrar (Holiday — Green Day)
Se você quer partir, cuide-se / Espero que faça muitos bons amigos por aí / Mas lembre-se (Wild World — Cat Stevens)
Os rostos mudam e as cores também / Palavras certeiras no momento certo / A multidão não anda, a multidão corre (Tanzt du noch einmal mit mir — Broilers)
Tudo começou quando perdi minha mãe / Sem amor por mim / Sem amor por ninguém / Procurando um amor em um nível mais alto (Last Resort — Papa Roach)
Ela me olha como Peixes quando estou fraco / Há semanas estou preso em sua caixa em forma de coração / Fui atraído para sua armadilha magnética (Heart-Shaped Box — Nirvana)
Vamos discutir, porque em nosso belo país / Ao menos em teoria todos são terrivelmente tolerantes / Palavras não querem mudar nada, palavras não machucam ninguém / Então vamos falar disso (Deine Schuld — Die Ärzte)
Satélites me mandam imagens / Recebo no olho, levo até o fio / Girando como um dínamo / Sinto girar sem parar / Ficando sem chips (Who Made Who — AC/DC)
Chega de sonhos quebrados, sinto-me uma arma carregada / Cuspindo balas contra sua armadura de controle mental / Corte a língua dela, não acredite em uma palavra / Ela está caçando (Black Rose — Volbeat)
Você sabe que nasci para perder, e apostar é coisa de tolos / Mas é assim que eu gosto, querida / Não quero viver para sempre (Ace of Spades — Motörhead)
Uma coisa, não sei por quê / Nem importa o quanto você tente / Tenha isso em mente / Fiz esta rima / Para lembrar a mim mesmo de um tempo em que (In the End — Linkin Park)
E sempre de novo / São as mesmas músicas / Que fazem parecer / Que o tempo está parado / Porque nunca passa / Esta velha febre / Que sempre volta (An Tagen wie diesen — Die Toten Hosen)
Você não pode encher o copo antes de esvaziá-lo / Não entende o que vem adiante / Se não entende o passado / Nunca aprende a voar / Até estar diante do precipício (Satellite — Rise Against)
Meia-noite, preciso de rock / Há um caminhão à frente, luzes nos meus olhos / Meu Deus, não há tempo para virar (Detroit Rock City — KISS)
Ele vive em seu próprio céu / Busca tudo no Seven-Eleven / Passa a noite fora para ganhar a corrida / Desde que, desde que (Rebel Yell — Billy Idol)
O que fizemos com a inocência? / Ela desapareceu com o tempo / Nunca fez muito sentido / Morador adolescente / Desperdiçando mais uma noite (Monkey Wrench — Foo Fighters)''')
amap('''xc4pw|Vidas frágeis, sonhos despedaçados
lgeug|As pessoas morrem e partem
fw2kd|Não existe você e eu
7og16|Carregado, carregado
4hs00|Ultrapassado, ultrapassado
8d1jx|Decifrado, decifrado
q4xav|Ele vai ser seu Frankenstein
3gd6i|Ele vai fazer você se sentir muito bem
wegva|Ele te dá um doce sessenta e nove
8rjpl|Estou vivendo com algo que simplesmente não é justo
c89g0|Consigo sentir o medo crescendo
lzmbo|Criaturas sombrias por toda parte
s10qn|Cantar baixinho nas mãos
y9lg8|Preciso fazê-las queimar
32cau|Ouça meu coração frio se despedaçar
vk8sw|O dinheiro está do outro lado
q6kkx|Meu caminho de Jekyll para Hyde
szoyw|Alguma paciência por dentro
lldk6|Há muita coisa ruim, então tenha cuidado
pb66v|Vou matar seu próximo caso
raoxg|O amor verdadeiro é raro
0vnix|Atingiu o ponto sensível e libertou o porco em você
wf1ia|Contra a parede, sem piedade
r68on|Tudo passa, toda maldita briga
ateld|Não encontrando nada além de perguntas e demônios
38p41|Pise fundo no acelerador
u10jb|Quebrado por dentro, destruindo minha mente
jhxdk|Queria poder comer seu câncer quando você ficasse negra
q2j3c|Tudo em mim vai fazer você ser sequestrada
oq34y|Só se foi pelos gatinhos que desenham em sua abertura
wr0z0|Discussões estão bem
2uplh|Essa é uma ideia
a20sh|Vamos conversar em alta definição
gyuqc|Veja-os cair no chão duro e frio
zkkll|Você não tem conexão em uma cidade de oito bits
q2c4w|Pegue mais uma libra
c628s|Cozinhando, cozinhando, cozinhando sofrimento
vajm1|Atirando, atirando, atirando família
4xe81|Correndo, correndo, correndo melodia
ipued|E não esqueça o coringa!
1bwbd|Mas eu amo pôquer!
z4xv7|Até eu sou um fumante inveterado!
uw3y7|Eu tentei tanto
srxb5|Eu cheguei tão longe
4vlgs|Eu coloquei minha confiança em você
j668t|Quando estamos juntos
j0ryd|Quando nossa cabeça dá voltas
uu03d|Quando a nostalgia começa
9cvge|E você não pode amar de verdade antes de desistir disso
30z9o|E você não pode mudar a si mesmo enquanto se agarra a isso
7um5e|E você não pode ver a luz se há uma sombra diante dela
5fzdi|Preciso rir porque sei que vou morrer
ot0br|O que posso fazer? Não há tempo para chorar
136j9|Disparando um último adeus para você
caw0b|Isso não bagunça seu cabelo
f9gha|Ninguém se importa
qtkxl|Ele é o herdeiro
e8a5g|Planejando minha vingança
aj8dd|Sonhando com novos planos
e5x7d|Dormindo em um banco de praça''')
block('371','''Você está em um show da sua banda favorita. Qual música gostaria de ouvir?
Você está em uma festa. Onde encontramos você?
Qual destes títulos combina com você?
Vocês estão no carro e não conseguem concordar sobre a música. O que você faz?
O que um álbum precisa ter para você?
O que você escolhe quando vai a um restaurante?
Quando você gosta de ouvir música?
Que tipo de música você seria?
Você foi convidado para uma festa à fantasia. Como vai?
O que faz uma música ser boa?''')
amap('''f8gfz|Uma balada tranquila, com todos os isqueiros levantados
baz03|A música mais pesada, para entrar na roda
7l93b|O maior sucesso, para cantar junto a plenos pulmões
a0jxu|Uma música nova, que nunca tocaram ao vivo
peiqe|No bar, bêbado
7xmqe|No centro das atenções
uqlhy|De lado, observando. Discutir com bêbados não adianta
td556|Já fui embora: levei um amigo bêbado para casa
sq4jc|Capitão do Caos
i3fat|Duque do Headbang
fwmqd|Mestre do Rock
mxokh|Líder dos Solitários
i79ew|Imponho meu gosto, que é o melhor
18dwb|Fico fora da discussão. Tanto faz
zs1rf|Ouço algo desconhecido. Pode haver músicas boas que ainda não conheço
n2m71|Fazemos um acordo: cada um escolhe por meia hora
dpcea|Rock sólido, guitarras e volume. A guitarra imaginária está pronta
ovz59|Álbum? Hoje é tudo digital, ninguém compra isso
e5hhu|Um conceito, letras e melodias que arrepiam
wsgdy|Música que faz bem, para cantar no carro de janela aberta
iqqz0|Algo que nunca comi, para ampliar meus horizontes
iaa57|Não vou. É bobagem: como em casa
tl30x|Meu prato favorito de sempre
2ehwq|Um prato enorme para dividir, para todos provarem
zfui3|Quando estou de bom humor, para ir com tudo
ohcki|Quando preciso de motivação
10ybe|Quando ninguém pode me impedir de cantar alto e desafinado
20q24|Quando estou de mau humor. Música é o remédio
6kk24|Sucesso de uma música só
e4bqc|Faixa escondida
qdn8o|Faixa-título
dgaoc|Clássico que nunca envelhece
ct4uj|Tenho muitas ideias e escolho a mais maluca
s91qt|É bobagem, não vou
pgaxt|Knight Rider ou Exterminador do Futuro. Algo legal
tff9w|Vou, mas nada cafona. Um zumbi
lz49q|Algo novo e experimental, que ninguém fez antes
c0lkx|A mensagem é o principal
9rwc3|Guitarras, vozes ásperas e volume
pssav|Um bom riff, arrepios e vontade de cantar junto''')
block('345','''De qual música é este vídeo cheio de animais?
Qual música é apresentada neste videoclipe cult?
Este vídeo foi inspirado em “Um Drink no Inferno”. Qual é a música?
Esta música fez história em 1975. Qual é ela?
Com esta faixa emocionante, o roqueiro se tornou inesquecível. Qual é a música?
Neste vídeo, a banda interpreta pilotos, passageiros e a tripulação. Qual é a música?
Qual é o vídeo destes deuses do rock?
Lara Croft troca tiros com a banda neste vídeo. Qual é a música?
Foram feitos dois vídeos para esta música. A segunda versão, americana, virou um sucesso no YouTube. Qual é a música?
Este clássico tem mais de um bilhão de visualizações e é um dos vídeos de rock mais acessados. Qual é a música?
Este vídeo ganhou um prêmio da MTV em 1987 e chegou ao primeiro lugar das paradas. Qual é a música?
Muitas cenas deste vídeo vieram das ideias do vocalista. Ele se tornou o vídeo mais exibido da MTV. Qual é a música?
Esta música de 1997 parodia o grunge e começa com uma versão distorcida de “Smells Like Teen Spirit”. Qual é ela?
A banda corre nua por Los Angeles e encontra a atriz pornô Janine Lindemulder. Qual é a música?
Esta música foi um enorme sucesso, com três milhões de cópias vendidas. Qual é ela?
Este vídeo inclui cenas do filme “Loser” e um final adicional gravado para o videoclipe. Qual é a música?''')
block('323','''Qual vocalista encontrou um minipônei abandonado em um estacionamento e o levou para casa? Rocky de vez em quando também entra na casa.
Qual roqueiro adorava dinossauros quando criança e acabou criando répteis? Ele tem mais de 80 lagartos e cobras.
Qual amante de gatos dedicou a música “Delilah” a uma de suas gatas e, segundo dizem, telefonava para os gatos durante as turnês?
Qual roqueiro ganhou um canguru de seus agentes, entregou-o aos tratadores e o visitava no zoológico de Memphis?
Qual roqueiro tinha 18 cachorros vivendo em sua casa e diz gostar mais deles do que das pessoas?
De quem é a cacatua que tem seu próprio Instagram e aparece em um vídeo de “Surfin’ Bird”?
Qual roqueiro batizou seus gatos com nomes de rappers: Biggie e Eminem?
Qual roqueiro tinha um guaxinim chamado Bandit quando criança e o levava para pescar?
Qual roqueiro costuma dividir o palco com suas cobras de estimação?
Kelly Clarkson batizou seu bode de Natal em homenagem a qual roqueiro?''')
block('315','''Qual banda tocou no Polo Sul dentro de uma cúpula transparente, com o público ouvindo por fones de ouvido para não perturbar o ambiente?
Quem caiu do palco, quebrou a perna e terminou o show? Anos depois, voltou ao local e usou um dublê para fingir outra queda.
Quem cheirou uma carreira de formigas durante uma turnê com o Mötley Crüe?
Quem foi expulso da escola depois de urinar na comida do diretor?
Quem caiu de uma palmeira durante as férias, provocando o adiamento da turnê, e depois afirmou que era apenas um arbusto?
Quem atirou uma galinha para o público pensando que ela podia voar, mas a plateia a despedaçou?
Depois de se reunir, qual banda publicou um anúncio dizendo que a melhor banda do mundo procurava uma gravadora?
Quem comeu um verme vivo durante uma entrevista? Sua banda era conhecida por destruir quartos, urinar e vomitar no palco.
Quem foi advertido por um policial nos bastidores e depois insultou a polícia no palco, acabando preso?
Qual baterista ficou inconsciente por causa de álcool e drogas, deixando um garoto do público terminar o show em seu lugar?
Qual banda se apresentava no início da carreira usando apenas uma meia?
Quem atravessou o Atlântico em um navio, em uma viagem de dez dias, por medo de voar?
Quem começou em 1988 a “Never Ending Tour”, com mais de 2.600 shows?
Quem abandonou sua banda no meio da gravação de um álbum para fazer um teste para o Led Zeppelin?
Quem cuspiu em um piano no MTV Music Awards pensando que era o de Axl Rose, mas era o de Elton John?''')
block('306','''O que é importante para você em uma música?
Você é uma estrela do rock. Como começa seu show?
Qual destas músicas combina com seu dia?
Como sua música toca no rádio?
Qual é seu estado de espírito?
Você está em um hotel. O que assiste na televisão?
Quando você ouve música?
Qual é o tema da sua música?
Que viagem você faria?
O que você faria com a fama?''')
amap('''usqmg|A mensagem. Ela deve abordar os problemas do mundo
h4omi|O volume. Rock precisa ser alto
yz40n|Diversão, boa música e festa
qjjp4|A composição. Instrumentos e voz formando uma obra única
eah1c|Chego atrasado: estava nos bastidores com as groupies
0qv81|No escuro, só eu e a guitarra. Para arrepiar
px81g|Com um estrondo: a festa começou
ytzhd|Com uma introdução significativa que cria tensão
3ugkd|A maioria dos países a proíbe por causa da linguagem pesada
lkx1c|É o maior sucesso de todos os tempos
ygp2u|Toca uma versão curta. Quem quiser os nove minutos completos compra o álbum
9g07u|A mensagem crítica não agrada a todos. Ao vivo, ela é ainda maior
cx3q0|Teatral
296jt|Alegre
2ihk6|Pensativo
6j79n|Aventureiro
8w9im|Um debate político
wto4c|Desbloqueio os canais codificados
un2r7|Um drama de fantasia, com diversão e suspense
3kzto|Televisão é chata. Tudo lixo
8eijm|Quando estou de bom humor, para festejar em qualquer lugar
o19vt|Quando estou de mau humor e melancólico
6umtw|No carro, de janelas abertas, cantando junto
pdnde|Sempre, 24 horas por dia
cw398|Sexo, drogas e rock’n’roll
6wnjn|Política
vblcr|Liberdade
qbi0n|Autorreflexão
9yovc|De moto pelos Estados Unidos, para espairecer
c7k80|De festival em festival com os amigos, festejando
ooxzr|Uma cidade cheia de cultura, para aprender sobre o mundo
2f6nr|Não viajo. Em casa é confortável
xtcva|Vou a todas as festas e conquisto as mulheres
ro6y0|Torno o mundo melhor
6abg8|Amo a música e quero deixá-la para as próximas gerações
j4fe0|A fama incomoda. Só a música importa''')
block('298','''Como rockstar, eu…
Por que você discutiria com seu melhor amigo?
Prefiro ir a um festival…
Qual é o lema da amizade de vocês?
Seus pensamentos são:
O que vocês fazem primeiro quando vão a um show?
Em que vocês sempre concordam?
Como conheceu seu melhor amigo?
Qual palavra descreve melhor você?
Em qual crime seu amigo ajudaria você?''')
amap('''qfz0t|… escreveria um hino do rock que todos conhecessem e que me tornasse imortal.
c4en4|… modesto como sou, criaria a paz mundial!
c2ypb|… apareceria constantemente nas manchetes por causa das minhas loucuras.
h3pkn|… faria festas com sexo, drogas e rock’n’roll. Só se vive uma vez!
ujkqs|Na verdade, nunca discutimos. Somos muito tranquilos.
s4k7r|Porque ele ou ela não tem tempo de ir comigo ao próximo show.
qvn8g|Gostamos da mesma mulher ou do mesmo homem.
oggsw|Não brigamos: debatemos!
xkmls|Com um grupo enorme. Mais gente, mais diversão!
pnj9t|Com meu melhor amigo ou amiga. Juntos, com certeza será lendário.
gxdef|Sozinho. Sempre conheço gente nova e ninguém pode me irritar.
u4jmh|Não vou. Prefiro ficar em casa trabalhando na minha música.
ce5pp|Viva e deixe morrer.
x01kw|Venha como você é.
4m07r|Vamos fazer você vibrar.
th0d1|Podemos ser heróis.
rnzd0|É um belo dia. Não o deixe escapar.
7h1ae|Somos mortos pela morte.
lvd35|Somos sonhadores.
xvyv2|Um pouco melancólicos. Você também mostra isso na sua música.
cxcuz|Sempre no aqui e agora. Preocupações ficam para depois.
5t1dp|Frequentemente bobos. Na verdade, não existe diversão demais.
4t0xc|Às vezes mais sérios. Afinal, assuntos sérios precisam de reflexão séria.
95r9s|Claro: buscar cerveja.
6c1kb|Procuramos o melhor lugar, bem em frente ao palco.
6ggxz|Primeiro vamos ao estande de camisetas escolher a roupa certa.
737n3|Assistimos à banda de abertura para entrar no clima antes da nossa banda favorita.
61bq8|Na música do carro. Existe algo além de rock?
rrl9y|Nos festivais deste ano: todos!
y724y|Em querer mudar alguma coisa no mundo.
3lbed|Em quem é a mulher ou o homem mais atraente da sala.
nptmz|Ficamos de castigo juntos depois de uma briga. Desde então, inseparáveis.
vop46|Já montamos nossa banda no jardim de infância. É bom começar cedo.
m1ozf|Estávamos na mesma fila da cerveja em um show. O começo de uma grande amizade!
dq4sl|Estávamos em uma manifestação. Não lembro mais contra o quê.
32zbw|Nasci para o palco
djusi|Anarquista de meio período
bckw9|Conquistador ou conquistadora
2pxxz|Filósofo amador
c8i7d|Entramos escondidos nos bastidores de um show para conhecer nossos ídolos.
466t1|Na verdade, sempre preciso tirá-lo de alguma enrascada.
bikph|Assaltamos uma cervejaria. Cerveja grátis para todos!
naw4y|Destruímos um quarto de hotel. Rock’n’roll, baby!''')
block('290','''“Antes eu tinha um problema com drogas. Hoje ganho dinheiro suficiente.”
“Cada época tem seu enorme ponto cego moral. Talvez não o vejamos, mas nossos filhos verão.”
“Querer ser outra pessoa é um desperdício da pessoa que você é.”
“De tudo que perdi, sinto mais falta da minha cabeça.”
“Agora somos mais populares que Jesus.”
“Tudo bem ser um perdedor. Só depende de quanto você é bom nisso.”
“Para ter ressaca, primeiro você precisa parar de beber.”
“A vida é uma merda, mas de um jeito bonito.”
“Não serei uma estrela do rock. Serei uma lenda.”
“Finja até conseguir.”
“Perca seus sonhos e perderá sua cabeça.”
“Tenho o blues no coração e o diabo nos dedos.”
“Não somos arrogantes. Só acreditamos que somos a melhor banda do mundo.”
“O amanhã pertence a quem consegue ouvi-lo chegar.”
“Não é um show de rock. É uma manifestação.”''')
block('282','''Como Bruce Dickinson também é chamado por causa de sua voz?
Qual é o apelido de Bob Dylan?
Como Bruce Springsteen é conhecido pelos fãs?
O Die Ärzte se descreve como…
Qual é o apelido de Eric Clapton?
Qual é o apelido de Ozzy Osbourne?
Como os Beatles também são chamados?
Johnny Cash é o…
Qual é o apelido de Billy Joel?
Qual é o apelido de Doro Pesch?
Como Prince é chamado?
Qual é o apelido de Keith Richards?
Qual descrição do The Clash está correta?
Elvis Presley é…
O que são os Rolling Stones?''')
amap('''bna03|Freio de trem-bala
orwv8|Super-humanos do rock’n’roll
579bg|A melhor banda do mundo
2q8rz|A banda dos cabelos de cogumelo
n7pyq|Princesa de Wacken
ippwn|Rainha da escuridão''')
block('278','''Você está no carro com os amigos, a caminho de um festival. O que faz para não se entediar?
Como está seu quarto ou apartamento?
Quando alguém me joga uma bola, eu…
Vocês estão organizando uma festa. De quais tarefas você cuida?
Em um show, eu estou…
Em uma palavra, você é:
Qual momento da sua música favorita você mais espera?
Quando coloco meu álbum favorito, eu…
Como sua banda seria formada?
Como sua banda acabaria?''')
amap('''jz6bo|Repasso mentalmente tudo de que precisamos: barraca, cerveja, ingressos. Tudo certo, a festa pode começar!
5j87n|Sou o motorista, então é melhor me concentrar no trânsito.
8xtsf|Com boa música na viagem, já coloco todos no clima do festival. Rock’n’roll, baby!
860nj|Para dar tudo no festival, durmo antes. A festa só começa quando chegarmos.
e4lqw|Depende de quem olha! Eu diria que é uma bagunça organizada.
0yh1b|Impecável, cada coisa em seu lugar. Como encontraríamos algo de outro jeito?
0022a|Só arrumo quando alguém avisa que vai me visitar.
nk0dy|No momento, durmo no sofá de um amigo…
hxdir|… me abaixo para não ser atingido.
634fm|… PÁ! Peguei. Tenho reflexos instantâneos.
fbdiz|… pego, claro. Mas chega de brincadeira.
6cglk|… peço mais duas e começo a fazer malabarismo.
0bs2y|A diversão! Garanto que todos aproveitem. Deixo a organização para os outros.
e1thd|A maior parte acaba comigo de novo. Mas cuido de tudo com gosto, da decoração às bebidas e comidas. É hora de fazer várias coisas ao mesmo tempo!
vaes5|Cuido do local. Com uma boa base, só pode dar certo.
oti6d|Cuido da música: caixas de som e um DJ que só toque o melhor rock.
6a7ct|… no bar, curtindo a música tranquilamente.
4cbom|… sempre procurando meus amigos.
wzk7e|… dançando. O que mais seria?
wqtl0|… atravessando o salão no crowd-surfing.
qy4yx|Versátil
e4iwu|Pensador fora da caixa
6rlgq|Incansável no trabalho
obpx2|Pirata das festas
76sr1|O solo de bateria. Aí a coisa começa de verdade!
iwef4|A parte em que o vocalista grita com toda a força. Uma sensação incrível!
b8wmg|Como assim? Claro que o solo de guitarra! Toco junto na guitarra imaginária.
y0w10|O grande final, com todos os instrumentos e a voz juntos. Arrepiante!
d3mlo|… avanço até minha música favorita e a ouço sem parar.
a08cb|… ouço todas as músicas. O disco inteiro é um sucesso.
9usmz|… tenho duas ou três músicas que sempre ouço primeiro.
sxcfk|… um álbum favorito? Tenho pelo menos cinco!
1h78n|Publicaria um anúncio no jornal procurando integrantes.
0yhry|Meus amigos da escola e eu levaríamos a sério nosso pequeno sucesso como banda de garagem e tentaríamos conquistar a fama.
pau7p|Conversaria com o artista de rua que tem um som incrível.
cxpfa|Iria a um programa de talentos na TV e deixaria montarem uma banda para mim.
vsuqu|Avisaria aos colegas pelo Twitter que não quero mais saber deles.
t024e|Depois de décadas de sucesso juntos, decidiríamos que é hora de algo novo. Dizem que devemos parar no melhor momento.
ov9yf|Acabar? Nunca! Tocamos juntos até morrer e depois continuamos no céu ou no inferno.
y1gf5|Brigaríamos feio e passaríamos anos sem nos falar. Mas uma reunião não estaria descartada.''')
block('226','''Prefiro ouvir música…
Qual instrumento imaginário você toca?
Que roupa você usa quando vai a um show?
Qual animal de estimação você tem?
O que você mais gosta de fazer em shows?
Por qual causa sairia às ruas em uma manifestação?
O que faria se fosse uma estrela do rock por um dia?
O que você mais gosta de assistir na TV?
O que as vozes na sua cabeça estão fazendo agora?
Qual é sua bebida de festival?''')
amap('''cbyp8|… ao vivo, em shows e festivais, festejando com meus amigos.
0qszw|… em casa, no meu aparelho de som, dançando pelo apartamento.
dx4ml|… no carro. Aumento tudo e canto alto e desafinado.
qgtmv|… em um bar. Tomo uma cerveja com os amigos enquanto toca minha música favorita.
6meft|Guitarra imaginária, claro!
ioqf6|Bateria imaginária. Podem me dar as baquetas.
feksp|Teclado imaginário. Mando ver nas teclas.
1vmor|Nenhum. Sou o vocalista e pulo pelo palco com meu microfone imaginário.
4e8dr|Cabelo comprido e uma fantasia maluca. Algo que ninguém tem!
6wayc|Camisa de flanela, jeans rasgado e cabelo comprido bagunçado.
njvac|Cabelo em um moicano colorido, jaqueta de couro e um cinto de rebites indispensável.
to68g|Preto com preto!
5v782|Um papagaio. Ele também tem uma boca enorme.
czv9a|Um cachorro. Ele late alto acompanhando todas as músicas.
v94w7|Um gato. Admito: ele é o chefe.
ezggt|Um porquinho. Assim ele pode rolar comigo na lama no próximo festival.
0o9tj|Bater a cabeça, bater a cabeça, bater a cabeça. Depois geralmente me perco na roda.
ny2xc|Fico na primeira fila e canto junto a plenos pulmões.
ew974|Prefiro ficar no bar com uma cerveja gelada, assistindo ao espetáculo.
xlmki|Danço até a exaustão!
alp9k|Qualquer coisa contra o sistema.
b7yba|Definitivamente pela redução do preço da cerveja!
eba8l|Contra a digitalização da música.
b4ngh|Rock’n’roll deveria fazer parte da formação geral e ser ensinado nas escolas.
7i6gg|Sexo, drogas e rock’n’roll. Mais alguma pergunta?
vt8m3|Daria um show incrível, que entraria para a história.
2lci2|Claro que festejaria a noite inteira. Só se vive uma vez!
s5cn4|Claro: escreveria um clássico que me tornasse inesquecível.
g3i0o|Assisto a Alf ou The Cosby Show. Aquilo era televisão boa!
3qnxn|The King of Queens, Um Maluco no Pedaço. Algo divertido.
s51pp|Os Simpsons ou South Park. Algo engraçado e crítico à sociedade.
mn96e|Game of Thrones, The Walking Dead. Simplesmente épico.
b4up7|Discutem a quais festivais devo ir neste ano.
k3zwu|Cantarolam minha música favorita.
1pvpb|Estão brigando. Ainda não sabemos quem vencerá.
1uaqw|Na minha cabeça, na verdade, sempre é festa.
bx9lw|Cerveja. Existem outras bebidas?
k8rdt|Acho uísque com cola muito bom.
tcnpu|Não sou exigente. O que estiver disponível.
iy97t|Para não perder nada, fico acordado durante todo o festival com energéticos.''')
block('208','''“Ganhei minha primeira guitarra de verdade, comprada na loja de variedades…”
“Sem placas de parada nem limite de velocidade. Ninguém vai me segurar. Como uma roda, vou girar. Ninguém vai me atrapalhar…”
“Eu estava machucado e ferido, não conseguia dizer o que sentia. Não me reconhecia…”
“Nunca me importei com o que fazem. Nunca me importei com o que sabem. Mas eu sei.”
“Nadando entre canções de ninar doentias, sufocando com seus álibis. Mas é o preço que pago, o destino está me chamando…”
“Mas toque minhas lágrimas com seus lábios, toque meu mundo com seus dedos. E podemos ter a eternidade…”
“Há uma sensação que tenho quando olho para o oeste, e meu espírito chora para partir…”
“Bem-vindo a um novo tipo de tensão, por toda esta nação alienígena…”
“Gina sonha em fugir. Quando ela chora à noite, Tommy sussurra: querida, tudo bem, algum dia…”
“Através da tempestade alcançamos a costa. Você dá tudo, mas eu quero mais. E estou esperando por você…”
“Jogando alto, dançando com o diabo, seguindo o fluxo. Para mim, tudo é um jogo…”
“Trovão de heavy metal, correndo com o vento e a sensação que me domina…”
“O que vi? Posso acreditar que aquilo que vi naquela noite era real e não apenas fantasia?”
“Ouço você me chamar, e são agulhas e alfinetes. Quero machucar você, só para ouvir você gritar meu nome…”
“Venha coberto de lama, encharcado de água sanitária, como quero que você seja.”
“De pé junto ao muro. E os tiros passaram sobre nossas cabeças. E nos beijamos como se nada pudesse cair…”
“Há algo dentro de mim que puxa sob a superfície. Consome, confunde…”
“Você diz que quer um líder. Mas parece não conseguir se decidir…”''')
block('141','''Qual instrumento você toca?
O que você faz depois do show?
Por que quer ser uma estrela do rock?
Descreva-se em uma palavra!
Como é sua roupa de palco?
Por qual crime você seria preso?
Qual seria sua profissão se não fosse uma estrela do rock?
Seu humor diário tende a ser…''')
amap('''ptytd|Guitarra
0x6j2|Baixo
e7ulo|Me deem o microfone!
qliw2|Por que só um?
5xleq|Escrevo imediatamente o próximo sucesso mundial
pmy4j|Festa, festa, festa! Com groupies, álcool e drogas, claro!
y5i7k|Dou autógrafos e fico com os fãs
p6fdp|Primeiro fico sozinho. Preciso de tranquilidade
9hdg6|Pela fama. Quero ser admirado!
61tjz|Pelas groupies. Preciso de sexo!
x0u9y|Pela música. Quero me conectar com o público!
kr1rs|Por uma boa causa. Preciso de um sentido maior na vida!
hgn06|Nasci para o palco
gk3un|Transformador do mundo
g1z5v|Pioneiro
9ddpz|Palhaço
69t4d|Jeans skinny preto e uma camisa casual. Bem tranquilo
fk0eg|Preto! O importante é ser preto!
4riux|Quanto mais extravagante, melhor! O palco precisa de drama e lápis de olho!
v5ph1|Bandana, jeans rasgado e jaqueta de couro
mr2od|Ativismo. Sou preso em uma manifestação
ygkie|Briga, drogas, vandalismo, insulto. Escolha!
cvf4l|Atentado ao pudor. Nem todos gostam do meu show…
5obmp|Alguma brincadeira. Sou o palhaço da turma!
1nhua|Criminoso
fbp9l|Veterinário
8305m|Agente de desenvolvimento humanitário
otqjb|Dono de bar
t1o1m|Sombrio
dqchg|Eufórico
fohkb|Agressivo
malzr|Equilibrado''')
def rmap(s):
 for line in s.strip().split('\n'):
  if line:k,title,desc=line.split('|',2);R[k]={'title':title,'description':desc}
rmap('''yiko9|Stream ao vivo|Você é um roqueiro de carteirinha. Classic rock, punk, metal: você encontra algo em cada estilo e gosta sobretudo da variedade. Por isso, o stream ao vivo da RADIO BOB! é perfeito para você. Aqui você recebe diariamente o rock mais pesado nos ouvidos, além de fatos interessantes e notícias sobre o mundo da música apresentados pelos nossos locutores.
pwapc|Stream de classic rock|Você é fã de rock desde que se entende por gente. As lendas do rock conquistaram você: Queen, The Rolling Stones, The Who e muitos outros. Você conhece todos os sucessos. Por isso, o stream de classic rock é perfeito para você. Aqui você ouve as pérolas do classic rock 24 horas por dia. Continue rockando!
itczm|Stream Harte Saite|Pesado, mais pesado, VOCÊ! A música pesada é seu mundo. Cabelo comprido, bater a cabeça e se jogar na roda nos shows: nada é melhor para você. No stream Harte Saite da BOB, você pode bater a cabeça ao som de Motörhead e Metallica o dia inteiro, até a cabeça latejar.
aper4|Stream de punk|Tanto faz se você tem cabelo colorido e moicano ou carrega o punk apenas por dentro. O stream de punk da BOB é obrigatório para todo rebelde! Aqui você atravessa os primeiros tempos do movimento punk com Ramones e The Clash, mas bandas como Die Ärzte e Green Day também não podem faltar. Ligue o stream e vá para o pogo!
whcyg|Stream de novos artistas|Por que vocês sempre tocam as mesmas coisas antigas? Isso não vale para o stream de novos artistas da BOB. Aqui há apenas bandas novas e músicas novas para fãs curiosos como você descobrirem. Apresentamos bandas emergentes de toda a Alemanha e suas músicas. Então entre no stream e curta música nova!
dfobh|Stream de rock medieval|Saudações, cavaleiros e nobres damas! No stream de rock medieval, verdadeiros guerreiros como você encontram suas bandas favoritas, como Saltatio Mortis, In Extremo e muitas outras. Catapulte-se de volta à Idade Média e esteja sempre preparado para a próxima feira medieval. Deixe o stream tocar!
cqhvb|Infelizmente, foi uma atuação ruim.|Talvez você precise pesquisar novamente o que aconteceu nos anos 90!
5jp0m|Está razoável, mas ainda há muito espaço para melhorar!|Pelo menos você conhece os acontecimentos mais importantes dos anos 90. Não desista!
nbqk7|Nada mal!|Você já conhece bem os anos 90, mas ainda faltam alguns fatos para se tornar um verdadeiro especialista. Continue assim!
s4diy|Imbatível!|Ninguém supera seu conhecimento. Você é um verdadeiro especialista nos anos 90! Rock on!
l1we0|Fracasso XXL|Você dormiu nos últimos 70 anos? Seu conhecimento da história do rock é uma enorme lacuna. Tenha vergonha e estude mais um pouco!
30ipq|Precisa de reforço|Você tem algum conhecimento, mas está longe de conhecer toda a história do rock. Para se tornar especialista, precisa aprender muito mais!
zaxdh|Raposa esperta|Ei, nada mal! Só mais algumas respostas certas separam você do título definitivo de especialista na história do rock. Continue assim!
y5k3h|Guru do conhecimento|Incrível! Ou você viveu a história do rock ou recuperou tudo depois. Você é um verdadeiro especialista!
wccmj|1 — excelente:|Aprovado com a nota máxima. Você é o aluno aplicado entre os roqueiros. Bravo!
za0gg|2 — bom:|Dá para ficar bastante satisfeito. Você está acima da média.
qne45|3 — satisfatório:|Bem, pelo menos você se saiu razoavelmente bem. Não precisa se envergonhar do vestibular do rock, mas algumas matérias não são seu forte.
qaqsc|4 — suficiente:|Chegou por pouco. Você recebe o diploma do rock, mas só por consideração aos seus pais!
pzqkj|5 — insuficiente:|Puxa, mas quase acertar ainda é errar. Alguém terá de fazer uma rodada extra.
bz2fa|6 — péssimo:|Tenha vergonha! Nem um ponto. Pelo visto, alguém não estudou…
cuoq3|Puxa! Isso não deu certo…|É melhor olhar os músicos com atenção novamente e estudar os integrantes das bandas.
hq59x|Bem, dá para melhorar.|Você reconhece os roqueiros das suas bandas favoritas, claro, mas queremos que amplie seus horizontes! Então olhe também as outras bandas.
q69hq|Muito bom!|Você reconheceu muito bem a maioria dos rockstars, mas ainda pode melhorar! Dá para memorizar os últimos rostos também. Continue assim!
4xabn|Realmente impressionante!|Você conhece todo mundo. Sua memória é invejável. Continue rockando!
di3vg|Infelizmente, não deu certo.|Seu conhecimento sobre barbas ainda deixa a desejar…
jkpvi|Nada mal!|Mas ainda há espaço para melhorar. Observe novamente as barbas dos seus rockstars favoritos antes de tentar outra vez.
p9hx6|Quase tudo certo!|Parece que você conhece bem as barbas dos rockstars…
gr2t7|Uau! Você é um verdadeiro especialista em barbas…|Tudo certo!
9bt0y||Você ainda não é um mestre das curiosidades. Mas tente novamente e experimente os outros quizzes: logo conhecerá os fatos divertidos da história do rock!
1mhxp||Nada mal! Parece que você leu bastante sobre a história do rock e também guardou as informações. Se repetir o quiz e explorar nossa página, conhecerá ainda mais histórias para contar na ocasião certa!
68r9t||Quase perfeito! Parece que você conhece bem as pequenas e grandes histórias dos nossos rockstars. Faltam um ou dois detalhes, mas talvez já os tenha guardado depois desta rodada!
6bola||Temos uma verdadeira enciclopédia do rock diante da tela! Continue acompanhando essas pequenas histórias e talvez descubra mais uma ou duas!
3yyha|Dá para melhorar…|Mas na próxima vez, com certeza, vai dar certo!
r1rqs|Nada mal!|Você conhece algumas datas de lançamento.
2yebb|Uau, quase tudo certo!|Na próxima vez, com certeza, você alcança a pontuação máxima.
17jcn|Perfeito!|Você é uma enciclopédia musical ambulante. Tiramos o chapéu.
c2sd9|Cabeça erguida.|Na próxima vez, você vai se sair melhor!
3yl59|Nada mal, parece que você conhece MTV Unplugged.|Talvez tenha crescido ouvindo isso?
ecsdl|Quase tudo certo!|Você conhece bastante de MTV Unplugged. Pelo visto, gosta das apresentações acústicas dos rockstars.
gikp6|Uau! Você foi perfeito.|Tiramos o chapéu! Você é um verdadeiro especialista em MTV Unplugged.
ae28g|Dá para melhorar bastante.|Ligue o stream dos anos 70 e aprenda um pouco mais sobre rock!
bmpn2|Bastante bom!|Você tem a visão geral, mas ainda pode trabalhar nos detalhes.
3clgh|Quase um especialista!|Poucas lacunas de conhecimento, e até algumas perguntas menos comuns foram superadas!
so5ik|Ou você cresceu nos anos 70 ou tem uma paixão absoluta por essa década em que o rock se tornou enorme.|Respeito!
q27id|Nenhum erro.|Você é um verdadeiro especialista no rock dos anos 70!
9s1r3|Rei ou rainha|Você está no topo e cuida com carinho de seus súditos. Organiza as grandes festas principalmente para alegrar seu povo e é, por assim dizer, o organizador de festivais da Idade Média. Você se sente bem quando a população está bem e aprecia as apresentações de seu trono, a certa distância, aproximadamente onde ficaria a torre de som.
fsxmm|Trovador:|Você é a estrela do rock da Idade Média. Tem talento musical e sabe divertir as pessoas, conhece seus colegas músicos e viaja com seus companheiros de castelo em castelo. Mas também não se acha importante demais para se apresentar sozinho em uma taverna em uma boa noite.
2ncem|Povo comum|Você trabalha duro e busca sua recompensa nas festas populares! Com suas coisas e os outros da região, sai do campo ou da oficina direto para o show. Hoje, o cotidiano fica de lado. Soltar-se de vez e extravasar bem em frente ao palco: é por esses momentos que tanto trabalho vale a pena.
pg6vu|Cavaleiro ou integrante da corte|Você tem fortes laços com seu grupo e está sempre fazendo algo com as mesmas pessoas, seja começando esportivamente em uma justa ou terminando com uma festa animada no grande salão do castelo. Para representar sua posição, a armadura está sempre polida e o vestido sem amassados.
2sryp|Bobo da corte|Você é agitado e cheio de energia, e onde você está sempre há festa. Tanto faz se há um plebeu, um nobre ou um rei diante de você. Você quer se divertir e se diverte. Seu bom humor contagia facilmente quem está ao lado. Por isso, deixam você fazer muita coisa: sem você, não seria a festa do ano, e no ano seguinte voltam a convidá-lo de boa vontade.
v2537|Puxa, isso não deu certo.|É melhor estudar os logos das bandas mais um pouco. Vai dar certo!
4fam0|Foi razoável, mas queremos ver mais de você!|Olhe novamente os logos com calma. Na próxima vez, você vai se sair melhor.
8izfj|Nada mal!|Agora faltam só um ou dois logos para você ser um verdadeiro especialista. Continue!
rbeop|Uau! Quero ver alguém fazer igual!|Você conhece todos os logos de bandas. Respeito!
m9fum|Careta|É melhor ir arrumar sua gravata. Você não tem lugar na cena punk. ;-)
ipx78|Punk de fachada|Um jeans rasgado ainda não faz de você um punk. É melhor continuar praticando com nosso stream de punk! :-)
eg87u|Punk disfarçado|Seu coração punk está no lugar certo e a revolta punk dorme dentro de você. Nos shows, você finalmente deixa seu punk interior sair! ;-)
ntq8o|Lenda punk|Você é punk da cabeça aos pés! A rebeldia corre nas suas veias e você não tem medo de mostrar seu lado punk ao mundo! Rock on! ;-)
j5yf7|Não deu em nada.|Mas cabeça erguida: você só precisa aprender melhor as letras.
f5u98|Tudo bem, já é um começo, mas ainda não é grande coisa!|Pelo menos você conhece as letras mais famosas, mas precisa dominar o resto também!
9g1e9|Nada mal!|Se memorizar as últimas letras, ninguém mais engana você. Continue assim!
4yo5b|Você é o Boss!|Tudo certo. Assim, você deixa todos para trás! Rock on!
v7bc1|Puxa, isso não deu certo.|É melhor estudar os antigos nomes das bandas mais um pouco. Vai dar certo!
rd6vz|Foi razoável, mas queremos ver mais de você!|Veja novamente os antigos nomes das bandas com calma. Na próxima vez, você vai se sair melhor.
rl8n4|Nada mal!|Agora faltam só um ou dois antigos nomes para você ser um verdadeiro especialista. Continue!
8nhcj|Uau! Quero ver alguém fazer igual!|Você conhece todos os antigos nomes das bandas. Respeito!
b23vj|Summer of '69 — Bryan Adams|O verão não deixa você apenas feliz, mas também um pouco melancólico ao lembrar todos os dias de verão da juventude. Nas férias, você prefere deitar em uma espreguiçadeira no jardim e ouvir no rádio seus sucessos favoritos de antigamente. Claro que Summer of '69 não pode faltar!
3ptnd|Sweet Home Alabama — Lynyrd Skynyrd|Você sempre quer aproveitar seu verão com o máximo de rock. Seja em uma longa viagem de férias ou curtindo os dias livres em casa, com a trilha certa você sempre curte! Nem um dia chuvoso de verão incomoda. Com Sweet Home Alabama como música de verão, seu verão não pode ser ruim.
encco|Jump — Van Halen|Seja pulando na água fresca em uma festa na piscina ou se divertindo na roda de um festival, verão significa bom humor, noites longas e quentes e clima de festa! Por isso, Jump não pode faltar na sua playlist de verão. Bom humor garantido!
km7sx|School’s Out — Alice Cooper|School’s Out! Isso significa um verão inteiro de aventuras pela frente, com seus amigos. No verão, seu lar é praticamente cada festival do país. Vocês curtem a cerveja gelada e os muitos shows. Nenhum tempo ruim estraga seu humor. É hora de festa!
shk76|Paradise City — Guns N' Roses|Nas férias, você quer conhecer algo novo, de preferência com o melhor tempo. Por isso, foge do verão instável da Alemanha para lugares quentes com mar e praia. Beber coquetéis e simplesmente aproveitar a vida. Como isso é quase estar em Paradise City, esta música não pode faltar na sua lista para adoçar o verão.
dfl5w|One More For The Road — The New Roses|Janelas abertas com o carro em movimento e música no máximo: essa é sua sensação de verão. Guitarras na fogueira, cerveja gelada na mão e, de dia, um show de rock ao ar livre. Você quer que o verão nunca termine. One More For The Road deve estar na playlist para tornar seu verão inesquecível!
auij5|Você precisa se esforçar um pouco mais se quiser fazer parte dos especialistas em rock!|
tt4ec|Já está bom.|Na próxima vez, com certeza, você reconhece as últimas músicas também.
664t5|Ótimo! Tudo certo.|Ninguém engana você! Você arrasa!
9ox0v|Isto é a vida real? Ou é apenas fantasia?|Você sempre faz tudo à sua maneira, não importa o que digam. Assim como viveu, partirá do seu próprio jeito, com palavras cujo sentido ninguém entende direito. Você é uma pessoa extravagante, às vezes muito excêntrica, mas todos adoram seu jeito estranho e honesto. Festas e shows com você são sempre lendários, e o céu dos roqueiros receberá você com uma festa enorme.
omn2k|Vamos festejar como se amanhã fosse o fim do mundo|Você não quer deixar este mundo, mas todos precisam partir um dia. E você consegue criar uma festa em qualquer lugar. Então por que não no céu ou no inferno? Uma verdadeira fera das festas como você vive pelo lema sexo, drogas e rock’n’roll, e continuará em uma festa eterna depois da morte.
icf6d|Sonhe, sonhe até seus sonhos se tornarem realidade|Você é um pequeno poeta amador e gosta de sonhar acordado. Sua visão romântica do mundo e da vida não agrada a todos, mas você não liga. Só quer uma vida bonita, com muito rock e boa música, e depois de morrer deixar o rock chover sobre as pessoas lá do céu.
3d312|Nascidos para causar o inferno, nascidos para causar o inferno. Sabemos como fazer e fazemos muito bem|Uma coisa é certa: provavelmente você não vai para o céu dos roqueiros. Já garantiu um lugar no purgatório eterno e tem até um pouco de orgulho disso. Se em vida você não liga para regras, na morte menos ainda. Você é um hard rocker durão e não deixa ninguém mandar em você. Até a morte tem medo de você… Você vai rockar a morte até o fim dos tempos!
1xa6t|Corte minha vida em pedaços. Este é meu último recurso|Para que serve tudo isso? Estar vivo ou morto é meio indiferente para você. Com seu jeito melancólico, você consegue estragar o humor dos outros. Não tem vontade de festas, shows ou qualquer outra coisa; a vida é meio entediante… Mas você também não acredita em vida após a morte. Provavelmente não conseguiria escolher entre céu e inferno e assombraria eternamente este mundo e os vivos como um fantasma.
g4068|Pegue minha mão, vamos conseguir, eu juro. Vivendo de uma oração|Você é um verdadeiro hard rocker. Bem, pelo menos é o que pensa… Talvez seja apenas o fã de rock comum, mas e daí? Sua vida é cheia de shows, pessoas incríveis e muita música. O que mais desejar? Você vive uma vida longa e cheia de rock e vai satisfeito para o céu dos roqueiros. Claro que lá o rock continua…
8p26z|É um longo caminho até o topo!|Mas você conseguiu. Você é o verdadeiro especialista em AC/DC. Os sinos do inferno tocam só para você.
90exw|Você está no Rock n Roll Train, rumo ao fã de AC/DC que sabe tudo!|Só precisa memorizar mais alguns fatos sobre a banda para saber tudo.
94cug|Você deveria conhecer melhor a banda.|Está entrando agora na estrada para o inferno!
rdlsa|Você foi atingido pelo trovão!|Tenha vergonha!''')
rmap('''rg9sq|Full Force|Você é um frequentador tranquilo de festivais, que não gosta apenas de bom metal, mas também aprecia outras formas de rock. Quer uma diversão musical variada com fãs de rock de gosto parecido, em um festival ainda relativamente novo, mas em crescimento constante. Neste verão, você precisa de peso e calor: deveria fazer parte da nova geração do metal e ir ao Full Force.
ckzpw|Vainstream|Você é uma pessoa aberta, sempre espalha bom humor e é ótima companhia para festejar. Mas, com tanta vontade de festa, provavelmente não sobreviveria a um fim de semana inteiro de festival. Por isso, prefere a rapidinha entre os festivais: Vainstream. Mas essa rapidinha não fica devendo! A festa começou!
8dac2|Wacken Open Air|Chuva ou sol: esse é seu lema, não precisamos saber mais. Todo ano você peregrina ao Wacken Open Air para reencontrar amigos, curtir bandas incríveis e viver os melhores momentos da sua vida. Wacken é seu segundo lar, e Holy Land é sua sala de estar. Você está na sua comunidade metal, que não deixaria por nada nem ninguém. Por isso, os ingressos do próximo ano já estão reservados.
bm25z|Open Flair|Você vai ao festival pelas bandas favoritas, mas o clima no acampamento costuma ser tão bom que poderia passar o dia inteiro lá. Gosta de tranquilidade, mas também de volume. No Open Flair, sente-se em casa, e todos ao redor são tão roqueiros quanto você. Nada impede a festa: no acampamento ou diante do palco, tanto faz, será lendária.
xbouu|Highfield|Entre os frequentadores de festivais, você definitivamente é o mais descomplicado. Basta uma cerveja gelada na mão e música boa. Punk, alternative, metal ou hard rock: tanto faz, você festeja onde estiver, com quem encontrar. Quem sabe esse seja seu segredo: uma festa não é festa até você chegar. Por isso, deveria ir ao Highfield neste ano. Uma enorme festa de rock espera por você.
3v3am|Summer Breeze|Quer um festival incrível? Música sensacional? Quer voltar a curtir rock de verdade? Então deveria ir ao Summer Breeze neste ano. Lá tem rock feito à mão até você cair. Tire seu colete do armário, seque sua cabeleira metal e já comece a se preparar mentalmente para o verão de festivais mais roqueiro da sua vida. O Summer Breeze será quente e barulhento neste ano: é melhor não perder!
2745l|Vá para o canto e tenha vergonha!|Esta atuação não merece aplausos. Você tem muito a recuperar no conhecimento de classic rock.
a6m90|Foi razoável, mas você ainda está longe de ser um verdadeiro especialista em classic rock.|Continue, você consegue!
f346k|O resultado é respeitável.|Mas faltam algumas respostas certas para ser um verdadeiro especialista em classic rock. Não desista: você está quase lá!
rnluy|Nota máxima com louvor!|Agora você pode se considerar oficialmente um verdadeiro especialista em classic rock. Rock on!
ln6se|Abaixo de 90 — abaixo da média:|Quando distribuíram cérebros, parece que você tinha ido buscar cerveja. Ops.
zjjcq|90 a 109 — média:|Você tem o QI do rock absolutamente comum. Nem sua avó consideraria você superdotado.
ohm5i|110 a 129 — acima da média:|Uau. Sua inteligência deixa mais de 50% dos roqueiros para trás. Impressionante!
g9cak|Acima de 130 — superdotado:|Parece que você desenvolveu seu QI do rock desde criança. Você é o cérebro entre os roqueiros. Respeito!
d6yog|Puxa, isso não deu certo.|É melhor estudar um pouco mais os nomes de registro dos roqueiros. Vai dar certo!
fo5mn|Foi razoável, mas queremos ver mais de você!|Olhe novamente os nomes com calma. Na próxima vez, você vai se sair melhor.
o08ph|Nada mal!|Agora faltam só um ou dois nomes para você ser um verdadeiro especialista. Continue!
nlfca|Uau! Quero ver alguém fazer igual!|Você conhece todo mundo. Respeito!
cu922|Menos de 20|Você é sangue novo no rock. Sente-se melhor na história mais recente do rock. Prefere as bandas e músicas novas às coisas antigas e chatas. Por isso, musicalmente, provavelmente nem chegou à maioridade.
qylnr|25 anos|Você prefere os anos 90. Talvez tenha sido levado pela onda grunge, ou apenas pelos destaques musicais dessa década. Em anos musicais, você tem os jovens 25 anos.
dr66g|35 anos|Década sólida, idade sólida. Em meados dos trinta, você encontrou seu estilo e sabe o que quer. Gosta do grande rock de estádio dos anos 80. Foi nessa época que escreveram as músicas mais lendárias e fizeram os shows mais inesquecíveis.
pjz4i|45 anos|Os loucos anos 70 são a década em que você está musicalmente em casa. Colocar discos de vinil e curtir rock: aqueles eram tempos! Pela música favorita, você revive essa década. Sua idade musical seria, portanto, cerca de 45 anos.
8535g|55 anos|Você já é veterano em música. Não gosta tanto dessas modernidades. Antigamente havia roqueiros de verdade, como Johnny Cash e Chuck Berry. O bom e velho rock de guitarra conquistou você. Musicalmente, teria por volta de 50 anos.
rcoa5|Mais de 60|Quanto mais velho, mais intenso: esse poderia ser seu lema musical. Os inventores do rock, como Elvis Presley, ainda têm grande valor para você, e é ao som deles que mais gosta de curtir. Musicalmente, já faz parte da velha guarda, com mais de 60 anos, mas está longe de enferrujar.
rseyw|Isso não deu em nada!|Você deveria ouvir melhor quando toca rock. Ouça ainda mais RADIO BOB! e vai dar certo!
860df|Foi razoável, mas pode melhorar!|Você domina as letras do rock básico, mas precisa estudar um pouco mais para fazer parte dos grandes.
0tqgl|Muito impressionante!|Você está perto de ser um verdadeiro especialista em rock. Continue e também vencerá as perguntas difíceis!
ahfj4|Uau! Quero ver alguém fazer igual!|Você é um cancioneiro ambulante. Provavelmente não existe música que você não consiga cantar inteira!
njjqe|Infelizmente, foi uma atuação nula.|Talvez precise pesquisar novamente o que aconteceu nos anos 80!
1ed3a|Está razoável, mas ainda há muito espaço para melhorar!|Pelo menos você conhece os acontecimentos mais importantes dos anos 80. Não desista!
c4bf6|Nada mal!|Você já conhece bem os anos 80, mas faltam alguns fatos para ser um verdadeiro especialista. Continue assim!
fd9o7|Imbatível!|Ninguém supera seu conhecimento. Você é um verdadeiro especialista nos anos 80! Rock’n’roll!
ovf0b|Bohemian Rhapsody|Você é uma pessoa de muitos rostos e facetas, que adora experimentar coisas novas. De início, isso parece loucura para muita gente, mas a maioria também ama e admira você por isso. Bohemian Rhapsody destaca sua disposição para experimentar. Embora as pessoas ao redor muitas vezes não entendam você, gostam muito de você, e não o incomoda ninguém compreendê-lo de verdade. Você simplesmente segue seu caminho! “Isto é a vida real? Ou é apenas fantasia?”
dgnow|Stairway To Heaven|Você é sensível e percebe rapidamente do que os outros precisam. Quase nada tira sua tranquilidade, mas às vezes parece um pouco melancólico. Stairway To Heaven mostra como você pode ser único, emotivo e direto. Muitas pessoas inicialmente não sabem como entender você e depois se impressionam com seu jeito agradável e acessível. “Mas, a longo prazo, ainda há tempo para mudar a estrada em que você está.”
lr2q8|Born To Be Wild|Você não gosta de complicação. Prefere ser direto e honesto. Além disso, vive e ama o bom e velho rock’n’roll. Born To Be Wild mostra a todos seu coração roqueiro apaixonado por liberdade. Você não quer reinventar a roda, apenas fazer com seus velhos amigos o que sempre foi divertido. “Nascemos, nascemos para ser selvagens.”
gn856|Enter Sandman|Casca dura, interior macio: é a melhor descrição de você. Por fora é sempre durão, mas quem o conhece melhor logo percebe seu lado suave. Por isso, Enter Sandman destaca melhor sua personalidade. Muitas pessoas avaliam você errado, mas você consegue convencê-las rapidamente do seu lado bondoso. “Vamos à terra do nunca, pegue minha mão.”
5a18h|Thunderstruck|Você sempre dá tudo. Por isso, às vezes parece selvagem e impulsivo demais para alguns, mas é apenas o rock puro que corre nas suas veias. Thunderstruck destaca seu coração roqueiro. É sempre força total: alto e sem censura, esse é seu lema. Com você, todos se divertem muito e aproveitam, mas de vez em quando você também deveria reduzir uma marcha, não? Que nada! “Você foi atingido pelo trovão!”
utuik|Smells Like Teen Spirit|Em geral, seu humor é um pouco melancólico. Raramente tem vontade de discutir com os outros: para que serviria? Gosta de seguir seu próprio caminho e quase nunca se importa com o que dizem. Aos seus olhos, tudo é inútil mesmo. Ainda assim, pensa bastante em temas importantes para você e tenta lutar por eles. Smells Like Teen Spirit destaca esse seu lado. Mas talvez encontre motivos para não ficar tão insatisfeito consigo e com o mundo? “Sou o pior naquilo que faço melhor, e por esse dom me sinto abençoado.”
vc955|Puxa, puxa, isso não deu certo.|Você precisa olhar os vídeos novamente com atenção!
4xdog|Bem, já não está ruim.|Mas ainda precisa de prática para reconhecer todos os vídeos. Continue!
36p3h|Foi QUASE perfeito!|Veja os últimos vídeos mais uma vez: então também os reconhecerá.
m92qe|Nada mal!|Você realmente conhece o assunto. É isso que esperamos de um fã de rock de verdade!
vn3l6|Não deu em nada.|Mas cabeça erguida: os animais dos roqueiros são fáceis de memorizar.
8ogj7|Tudo bem, já é um começo, mas ainda não é grande coisa!|Pelo menos você conhece os animais dos roqueiros mais famosos, mas precisa dominar o resto também!
36d1q|Nada mal!|Se memorizar os últimos donos roqueiros e seus animais, ninguém mais engana você. Continue assim!
npjw0|Você arrasa!|Tudo certo: você deixa todos para trás! Rock on!
t12yc|Nada feito!|É melhor pesquisar novamente as histórias dos roqueiros. Ouça RADIO BOB!: além de música boa, você também ouve todas as histórias dos bastidores.
ye09c|Pelo menos algumas estão certas.|Mas ainda há muito espaço para melhorar!
iy2n3|Está quase perfeito.|Agora só precisa conhecer as últimas histórias de cor e salteado para chegar lá!
hfscy|Impecável!|Você conhece todas as histórias. Ninguém engana você. Conhece não só boa música de rock, mas também as histórias malucas dos nossos roqueiros. ''')
rmap('''2x9p7|AC/DC|Assim como seu estilo de vida, sua música deveria seguir o lema sexo, drogas e rock’n’roll. Você vive o rock! Alto e direto, sempre com força total. Por isso, os caras do AC/DC seriam a formação ideal para seu hino pessoal. Enquanto Brian Johnson, Axl Rose ou quem estiver por lá depois canta a letra sugestiva sobre sua vida, Angus dispara seu riff de guitarra e a multidão vai à loucura.
88iss|Nirvana|Sempre um pouco pensativo e voltado para dentro, você não gosta de muita agitação ao redor. Por isso, uma letra de Kurt Cobain expressaria bem seu lado sensível. O Nirvana dedicaria uma música a você que não decepcionaria nem você nem seu estado de espírito melancólico.
w2qu1|Rise Against|Você gosta de volume, mas não ser um roqueiro suave não significa que nada importa. Assim como os caras do Rise Against, que se empenham especialmente pelos direitos humanos e pela proteção animal, você também é muito engajado e defende sua opinião em assuntos políticos. Por isso, uma música crítica do Rise Against seria a escolha certa para você. Talvez sua mensagem leve ainda mais pessoas a se interessarem por esses temas.
oz4b9|Steel Panther|Na sua opinião, um dia nunca pode ser entediante. Você sempre encontra uma maneira de se divertir. Mesmo quando passa do ponto e faz uma piada pesada a mais, na verdade está piscando o olho. Assim como os reis da festa do Steel Panther tiram sarro do glam rock com sua música, você atravessa a vida com autoironia. Por isso, justamente o Steel Panther deveria escrever um sucesso de festa para você, chocando e brincando com as pessoas com uma letra não muito apropriada para menores.
c7ipe|Bruce Springsteen|Você é uma pessoa comum que não reclama muito dos obstáculos cotidianos. Ainda assim, deseja um mundo mais justo. Por isso, Bruce Springsteen deveria escrever para você um sucesso de crítica social sobre a vida e os problemas com que toda pessoa comum precisa lidar. Claro que a sensação de liberdade e alegria de viver também não pode faltar. A música não deve ser deprimente, mas cheia de vontade de agir!
51gg8|Alice Cooper|Às vezes você está no seu próprio mundo e deixa a imaginação correr. Ama o drama, e isso também deve aparecer na sua música. Melhor perguntar a Alice Cooper se ele pode montar uma música épica que leve você e todos os outros aos mundos fantásticos que você tantas vezes imagina. Claro que uma introdução carregada de significado e um bom solo de guitarra não podem faltar.
nkfw2|Lemmy Kilmister|Tranquilidade é seu segundo nome. Pouca coisa tira você do sério. Com Lemmy, pode sentar no bar e aproveitar sua bebida tranquilamente. E quando os dois entram no clima de festa, a coisa esquenta. Juntos, vocês vivem o bom e velho rock’n’roll!
woxjx|Kurt Cobain|Você pensa em muitas coisas. Às vezes, talvez, até demais? Poderia se dar bem com Kurt Cobain. Juntos, filosofariam sobre a vida e tentariam entender o sentido de tudo.
28bev|Ozzy Osbourne|Na verdade, você é uma pessoa engraçada. Quase nada é constrangedor ou bobo demais, e por isso os outros muitas vezes olham você de um jeito estranho. Ozzy e você seriam uma combinação interessante. Poderiam fazer boas brincadeiras juntos, mas cuidado para não serem pegos!
x1ihf|Bono|Para você, festa ou diversão não vêm primeiro: quer dar um sentido maior à vida. Assim como Bono, não consegue simplesmente ficar sentado sem fazer nada. Vocês querem tornar o mundo melhor. Talvez não consigam salvá-lo, mas dão o primeiro passo para um futuro mais amigável.
nkffb|Mick Jagger|Qualquer um sabe festejar, mas quando você chega, vira um evento que ninguém quer perder! Você leva sexo, drogas e rock’n’roll ao pé da letra. Com Mick Jagger, sai pela noite, e ao fim os dois voltam para casa com uma roqueira atraente.
hpk4w|David Bowie|Com você, poucas coisas ficam como estão. Está sempre mudando algo: aparência, estilo musical ou personalidade. Nada está gravado em pedra. Por isso, seu parceiro perfeito para experimentar seria David Bowie. Juntos, poderiam tentar coisas novas e chegar a descobertas revolucionárias.
yhcet|Freddie Mercury|Onde quer que você chegue, tudo gira ao seu redor. E, graças ao talento, é fácil divertir as pessoas. Sua amizade com Freddie Mercury seria interessante, mas provavelmente não muito simples. Vocês poderiam disputar o favor do público e incentivar um ao outro a novas grandes atuações.
j8ehb|Não deu em nada.|Mas cabeça erguida: essas frases são fáceis de memorizar.
1548x|Tudo bem, já é um começo, mas ainda não é grande coisa!|Pelo menos você conhece as frases mais famosas, mas precisa dominar o resto também!
zy0hd|Nada mal!|Se memorizar as últimas frases, ninguém mais engana você. Continue assim!
ck66r|Você arrasa!|Tudo certo: você deixa todos para trás! Rock on!
mtwjh|Puxa, isso deu errado.|Talvez deva estudar mais um pouco os apelidos dos roqueiros. Assim, com certeza vai melhorar.
pn02g|Tudo bem.|Ainda não foi grande coisa, mas pelo menos você conhece alguns nomes. Continue!
7ygbt|Quase perfeito!|Você é muito bom. Continue e logo será um verdadeiro especialista. Dá para memorizar os últimos nomes agora também.
60cc5|Você arrasa!|Tudo certo: não é fácil fazer igual!
45ed3|Empresário|Relaxar é quase uma palavra desconhecida para você. Está sempre atento e tem uma visão geral. Sabe exatamente como conseguir o que quer, sem descartar alguns truques. Mesmo assim, as pessoas gostam de você e valorizam sua confiabilidade. Você é a voz da razão, mesmo quando isso significa estragar a diversão. Mas faz tudo porque quer o melhor para sua banda. Sem dúvida, seu trabalho é estressante, mas no fim sempre há um grande show e fãs satisfeitos.
2azsn|Roadie|Fazer várias coisas ao mesmo tempo é seu lema. Você se enche de trabalho e gosta disso. As pessoas dos bastidores costumam receber pouca atenção, mas pessoas como você são o coração secreto de uma banda. Faria tudo pelos seus. Montagem, desmontagem, tudo funcionando sem problemas: se for preciso, também dirige o ônibus da turnê. Você é um integrante completo, e a banda também deve seu sucesso a você.
sh4s7|Vocalista|Você nasceu para entreter. A vida é seu palco e, onde chega, gosta de estar no centro das atenções. Espalha bom humor por toda parte, e se colocarem um microfone na sua mão, a noite será lendária. Em cada projeto novo, coloca toda sua capacidade e conhecimento: colegas de banda e fãs agradecem. No palco, você se solta e celebra a música com as pessoas. Vamos rockar!
1qhj3|Guitarrista|Em um grupo, você geralmente é um dos mais barulhentos e chamativos. Adora fazer um bom espetáculo, mesmo sem nenhum palco por perto. Quando a música começa, quase ninguém consegue segurar você. Aquele formigamento na ponta dos dedos ao tocar as cordas da guitarra é puro rock’n’roll para você. Pula pelo palco e aproveita a atenção da multidão que grita diante de você. Mas também gosta dos momentos tranquilos, quando pode ficar sozinho com seus pensamentos.
pwe3r|Baterista|Você realmente tem o ritmo no sangue! É difícil ficar parado, pois precisa acompanhar a batida e conduzir as melodias das suas músicas favoritas. Com as baquetas na mão, dá a direção à banda. No fundo, você manda, inclusive nas relações pessoais. Nos relacionamentos, costuma assumir a liderança, sem ostentar isso. Sabe dar aos outros o espaço de que precisam, sem reduzir sua capacidade nem sua autoconfiança.
2zdqw|Baixista|Você é uma pessoa tranquila. Enfrenta cada problema com calma e encontra uma solução. Não é de dar ordens aos outros nem de se colocar no centro das atenções. É a boa alma da banda. Antes, depois ou durante o show, você não se agita! Enquanto o baterista bate com força e vocalista e guitarrista recebem os aplausos, você fica consigo e com a música.
f5wwl|Classic Rock|Você prefere tudo simples e descomplicado. Tendências novas não empolgam de imediato, e você prefere o antigo: classic rock ainda era rock puro! E está tudo bem. Encontrou seu estilo e segue assim pela vida. Nos grandes hinos do rock, canta mais alto que todos, porque nunca se cansa dessas músicas. É impossível não amar. Dentro de você há um pequeno nerd musical: interessa-se apaixonadamente por muitas coisas.
oy4p7|Hard rock|Alguns amigos diriam que você é meio louco, com carinho, claro. De vez em quando precisa de ação, senão logo se entedia. Para você, alto nunca é alto o bastante! Música não é só música, mas sua filosofia de vida. Fiel ao lema: sexo, drogas e rock’n’roll!
wrwsd|Punk|Um pouco de anarquia na vida? Obrigatório para você! Embora assim não houvesse mais regras para quebrar. E se ninguém se irritasse com suas loucuras, seria chato! Você luta sem condições pelos seus princípios e deixa outras pessoas furiosas. Mas não consegue evitar: às vezes seu pequeno rebelde interior aparece e precisa se mostrar a todos. Como isso nem sempre funciona no trabalho, a música faz isso por você.
fzlr1|Metal|Você gostaria de passar o ano inteiro em festivais com os amigos, batendo a cabeça e celebrando suas bandas favoritas. Mas em você há mais do que alguém que gosta de palco e festa. Acima de tudo, é uma pessoa tranquila e pé no chão, sempre disposta a brincar. Faz amizades em todo lugar, pois é acessível e confiável. Macio por dentro, metal por fora!
6db5i|Grunge|Tanto faz: você diz não ligar para as normas sociais, mas elas o levam à beira do desespero. Da euforia à tristeza profunda, seus sentimentos caminham por uma linha estreita. A música dá um palco às suas emoções. Ao ouvir, pode extravasar toda sua raiva e vulnerabilidade e limpar a cabeça. São justamente essas arestas que tornam o som e a vida interessantes. Você descobre beleza nas coisas mais feias.
r701c|Rock alternativo|Você não gosta que digam o que deve ou não fazer. Se algo dá errado, não é tão grave. Em compensação, os sucessos são ainda melhores. Gosta de experimentar coisas fora do comum e compartilhá-las. Na música e na vida, precisa de variedade e inovação: ficar parado é morrer.
no35d|Não! Isso não deu certo…|Você precisa voltar ao treinamento de músicas e praticar! Então: música ligada e letras para aprender!
z8y68|Bem, mais ou menos.|Você conhece os clássicos, mas está longe de ser profissional do rock! Precisa de reforço: ligue o player e continue praticando!
2anl2|Nada mal!|Alguém conhece suas letras! Ainda há espaço para melhorar, mas você chega lá!
jv9dx|Uau! Temos um verdadeiro roqueiro alfa!|Nas letras, não é fácil enganar você. Respeito!
e89vv|Axl Rose|Sexo, drogas e rock’n’roll, em partes iguais! A festa é tão importante quanto a música. Você costuma abrir a boca um pouco além da conta, e não só no palco. Briga? Você começou! Groupies? Pode mandar! Você é a diva do rock, mas na hora necessária entrega tudo, com microfone na mão e voz cortante!
e4sd3|Freddie Mercury|“Me deem um palco!” Esse é seu lema. Vive para o show e para o público. Musicalmente, ninguém engana você: sabe do que é capaz e explora sua criatividade até o limite. Com carisma e talento, tem os fãs aos seus pés. Mas, na verdade, é uma alma suave, uma pessoa tímida e sensível com um grande amor pelos animais.
fwsgc|Bono|Você é quem quer melhorar o mundo entre os roqueiros! Música é sua paixão, mas fazer o bem é sua missão. É versátil, na música e nos negócios. Tem o coração no lugar certo, mas às vezes pensa demais. Entoa um hino depois do outro, com um pouco de grandiosidade para transmitir bem a mensagem. Se depender de você, o rock salva o mundo!
jotdg|Lemmy Kilmister|Você não faz nada pela metade! Rock’n’roll puro e uísque com cola correm nas suas veias. Com a voz castigada, inclina-se tranquilamente sobre o baixo. Sem frescura, sem conversa, apenas rock sem concessões bem na cara. Mas não se leva tão a sério e, no fundo, é uma pessoa honestíssima, sempre presente para os amigos. Sexo e drogas são bem-vindos, mas o rock’n’roll vem primeiro!
3khov|Dave Grohl|A pessoa mais legal do rock é você! Mas sem ser molenga, claro. Amigável e confiável, atravessa a vida de dedo do meio estendido e piscando o olho. É versátil: tudo que toca vira ouro. Todos querem se casar com você, não só pelo talento musical, mas também pelo humor e pelo charme. Quero ver fazer igual!
v9ph1|Alice Cooper|Drama, baby, drama! Você gosta de chocar, pois acha que rock não é para fracos. A música sempre vem com o espetáculo certo! Na vida, já viu de tudo e participou de muitas festas, mas hoje leva a vida particular com mais calma. Prefere guardar o artista para o palco, e ali o solta de verdade. Esse animal de palco precisa sair regularmente!
wyaes|Joan Jett|Glam rock, punk rock, hard rock: essa é sua vida! Você é pioneiro musical e exemplo para muitos. Afetuoso, estiloso e engraçado, mas também duríssimo quando necessário. Segue seu caminho musical com determinação e sucesso. Seu amor pelos animais é parte firme da vida, mas não gosta de revelar muito da vida particular. Ninguém engana você, e quem vier com bobagem leva uma na cabeça!
ken3n|Imbatível!|Você conhece não só os rockstars, mas também seus amigos de focinho gelado!
cyg1d|Bom, mas ainda não muito bom!|Você sabe bastante, mas infelizmente ainda falta o último detalhe.
qmabw|Está razoável, mas ainda há muito espaço para melhorar.|Pratique mais um pouco!
rw6t9|Infelizmente, isso não deu em nada…|Você precisa voltar à escola, de cachorros!
xj038|Dave Grohl|Você é a tranquilidade em pessoa. Quase nada o tira do sério, e por isso também é uma companhia tranquila na quarentena. Com Dave Grohl, pode relaxar tomando uma bebida e esperar a quarentena acabar. E quando os dois entram no clima de festa, a coisa esquenta: festa em casa a dois! Juntos, vocês vivem o bom e velho rock’n’roll!
33wno|Tim McIlrath|Você pensa em muitas coisas, especialmente nestes tempos. Às vezes, talvez, demais? Poderia se juntar ao vocalista do Rise Against, Tim McIlrath. Juntos, filosofariam sobre esta crise e tentariam entender seu sentido. Talvez até surgissem músicas novas para lidar com a quarentena. Só não deveriam ficar sérios demais…
9cc9j|Ozzy Osbourne|Você é engraçado e topa tudo, então a quarentena vai entediá-lo rapidamente. Felizmente, isso não acontecerá com Ozzy como parceiro. Vocês passam o tempo com pequenas brincadeiras, e as semanas voam mais depressa do que imaginavam!
p57j2|Bono|Você quer dar um sentido maior à vida, também durante a quarentena. Assim como Bono, não consegue ficar sentado sem fazer nada, sem sentir o teto cair sobre a cabeça. Querem tornar o mundo melhor e, juntos, inventam muitas coisas para ajudar quem passa por dificuldades nestes tempos. Talvez não consigam salvá-los, mas dão o primeiro passo para um futuro melhor.
lpt4r|Alice Cooper|Você é uma pessoa legal, mas também não escapa da quarentena. Como não consegue ficar parado, Alice Cooper terminaria seu novo álbum com você, e à noite os dois ouviriam suas coleções de discos. Talvez, com tempo bom, jogassem golfe no jardim. ;)
kxfrm|Bruce Springsteen|Onde você chega, tudo gira ao seu redor. Mas na quarentena não há ninguém para entreter. Por isso, passaria bons momentos com Bruce, afastando o tédio. Provavelmente transmitiriam um show no Instagram todos os dias para curtir rock com as pessoas. Nesse espírito: continue rockando!
2c7ig|Algodão|Vá para o canto e tenha vergonha! Você não é duro nem como algodão. Quanto ao conhecimento de metal, tem muito a recuperar.
0dhm8|Bolinha de borracha|Foi razoável. Seu conhecimento o torna tão duro quanto uma bolinha de borracha, mas você está longe de ser um verdadeiro especialista em metal.
y0c3f|Pedra|O resultado é respeitável. Você é duro como uma pedra. Mas faltam algumas respostas certas para ser um verdadeiro especialista em metal.
k3d5w|Diamante|Uau! Você é mais duro que o diamante mais duro. Agora pode se considerar oficialmente um verdadeiro especialista em metal. Rock on!
zouhu|Você anda ouvindo as paradas escondido?|Precisa prestar mais atenção às letras. Continue ouvindo RADIO BOB! e vai dar certo!
flsis|Foi razoável, mas pode melhorar!|Pelo menos distingue rock de música popular alemã, mas é só isso. Uma dica para praticar: ouvir mais RADIO BOB!
naumb|Bastante impressionante!|Você está perto de ser um verdadeiro especialista em rock. Continue, e reconhecerá as últimas letras também!
gbfs6|Uau! Quero ver alguém fazer igual!|Você é um cancioneiro ambulante. Provavelmente não existe música que você não consiga cantar inteira!''')
rmap('''tevbs|Você é o especialista entre os cabeleireiros das estrelas. Nenhum penteado escapa ao seu olhar atento. Como recompensa, recebe o prêmio oficial de penteados do rock.|
tsvf3|Uau, nada mal! Com um pouco de prática, não será difícil chegar ao posto de deus dos penteados.|
urdgu|Não foi grande coisa. Você conhece os grandes rockstars, mas quando sai do rock comum, seu conhecimento de penteados tropeça. Continue praticando!|
w8o9g|Isso não deu certo. Com um resultado tão ruim, cuidado para não perder sua licença para bater a cabeça.|
kicib|Não deu em nada. Mas cabeça erguida: as capas são fáceis de memorizar.|
59cdp|Tudo bem, já é um começo, mas ainda não é grande coisa! Pelo menos você conhece as capas mais famosas, mas precisa dominar o resto também!|
ujl49|Nada mal! Se memorizar as últimas capas, ninguém mais engana você. Continue assim!|
qdo29|Você arrasa! Tudo certo: você deixa todos para trás! Rock on!|''')
D['807']='''Ozzy Osbourne, do Black Sabbath, e seu cachorro Rocky.
Keith Richards chamou seu cachorro de Ratbag.
A imagem mostra Jojo e Leroy, os cachorros de Lenny.
A imagem mostra Eric Clapton com seu cachorro Jeep.
Paul e sua cadela Martha.
Aqui, Buckley, o cachorro de Duff McKagan, olha para fora da cesta da bicicleta.
Diesel e Phoenix pertencem a Bret Michaels, do Poison.
Butch Cassidy e Sundance Kid são os cachorros do vocalista do Aerosmith, Steven Tyler.
Este é Hemingway, o buldogue, e seu dono Pete Wentz, do Fall Out Boy.
A imagem mostra Robert Plant e seu cachorro Strider.'''.split('\n')
for sid,rec in M.items():
 for native in V(rec['quiz']['results']):
  r=R[native['id']]
  if not native.get('desc'):
   r['title']=' '.join(filter(None,[r['title'],r['description']])).strip();r['description']=''
# Integral wording, retaining all details from the recovered native prompts.
block('371','''Qual música você mais espera em um show da sua banda favorita?
Em uma festa, você é…
Qual título você receberia?
No carro, você e seus amigos não conseguem concordar sobre qual música tocar. O que faz?
O que um álbum precisa ter para você comprá-lo?
Você sai para comer com os amigos. O que tem de gostoso?
Quando você mais gosta de ouvir música?
Se pudesse ser uma música, preferiria ser:
De que você se fantasiaria para uma festa à fantasia?
O que faz uma música ser boa?''')
block('345','''De qual música é este vídeo cheio de animais?
Qual música é apresentada neste videoclipe cult?
Este videoclipe foi inspirado no filme “From Dusk Till Dawn”. Mas de qual música é ele?
Com esta música, um pedaço da história da música foi escrito em 1975:
Com esta música cheia de emoção, este roqueiro se tornou inesquecível:
Neste videoclipe, a banda assume os papéis de pilotos, passageiros e tripulação:
Qual videoclipe está representado aqui? Dica: deuses do rock!
Lara Croft troca tiros com a banda neste vídeo:
Esta música tem dois videoclipes. A segunda versão, “americana”, virou um sucesso no YouTube.
Este clássico tem mais de um bilhão de visualizações no YouTube, o que o torna um dos videoclipes de rock mais acessados.
Este videoclipe ganhou o MTV Video Music Award em 1987. A música também chegou ao primeiro lugar das paradas.
Muitas partes deste vídeo vieram das ideias do vocalista. Além disso, é o videoclipe mais exibido na MTV.
Esta música saiu em 1997 e era uma paródia do grunge. No começo, toca uma versão distorcida de “Smells Like Teen Spirit”.
Neste videoclipe, a banda corre nua por Los Angeles e, em uma cena, encontra a atriz pornô Janine Lindemulder.
A música deste videoclipe foi um enorme sucesso e vendeu mais de três milhões de discos no mundo inteiro.
Partes do filme “Loser” foram usadas neste videoclipe, e um final diferente do filme foi gravado especialmente para a música.''')
block('323','''Este vocalista encontrou um minipônei em um estacionamento abandonado e o levou para casa. Desde então, o pequeno cavalo se chama Rocky e às vezes pode até entrar na casa.
Quando alguém ama dinossauros acima de tudo na infância, o futuro animal de estimação precisa ser um réptil, claro. Mais de 80 lagartos e cobras de todos os tipos vivem na casa deste músico.
Esta lenda do rock amava gatos. Chegou a escrever uma música sobre sua gata favorita, Delilah. Dizem que antigamente, durante as turnês, até telefonava sempre para os gatos.
Este rockstar ganhou um canguru de seu agente. Achou legal, claro, mas preferiu entregar o animal aos cuidados de especialistas e sempre o visitava no zoológico de Memphis.
Por algum tempo, 18 cachorros viveram na casa deste rockstar. Ele diz: “Amo cachorros. Entendo-os melhor que algumas pessoas.”
Este músico tem um verdadeiro pássaro: uma cacatua. Ela tem até sua própria conta no Instagram e participa com tudo do videoclipe da música “Surfin’ Bird”.
Este roqueiro tem uma casa cheia de gatos. Todos levam nomes de rappers famosos, como Biggie ou Eminem.
Este cantor de voz poderosa tinha, quando criança, um guaxinim chamado Bandit, com quem até ia pescar.
Os animais deste roqueiro não são apenas animais de estimação, mas também seus parceiros de cena. Suas cobras fazem parte regularmente do espetáculo no palco.
Este animal não pertence a nenhum dos nossos roqueiros, mas quando Kelly Clarkson ganhou uma cabra de Natal, deu ao animal o nome dele.''')
block('315','''Esta banda fez um show no Polo Sul, protegida por uma cúpula transparente. O público recebeu fones de ouvido para não perturbar o ambiente com o volume das caixas de som e amplificadores.
Este vocalista caiu do palco em um show e quebrou a perna. Mas isso não o impediu de terminar a apresentação até o fim. Quando voltou a se apresentar no mesmo lugar anos depois, pregou uma peça no público: contratou um dublê que entrou no palco e caiu novamente.
Este rockstar cheirou uma carreira de formigas enquanto estava em turnê com o Mötley Crüe.
Este lendário vocalista de rock foi expulso da escola porque urinou na comida do diretor.
Durante as férias, este veterano do rock caiu de uma palmeira. Por isso, a turnê seguinte da banda precisou ser adiada. Mais tarde, afirmou que era mais um arbusto do que uma árvore alta.
Este shock rocker oferece horror de verdade nos shows: uma vez atirou uma galinha no público enlouquecido. Pensou que ela pudesse voar, mas estava errado. A pobre ave caiu na multidão e foi literalmente despedaçada.
Com o anúncio “A melhor banda do mundo procura gravadora”, esta banda de rock alemã buscou uma nova gravadora depois de se reunir.
Durante uma entrevista, este roqueiro comeu vermes vivos. A banda inteira é conhecida por destruir quartos de hotel, urinar e vomitar ao vivo no palco.
Depois de se divertir com um fã nos bastidores e receber uma advertência da polícia, este vocalista ficou tão furioso que insultou os policiais durante o show, diante de todo o público. Foi então preso e levado embora ao vivo, no palco.
Este baterista ficou inconsciente no palco por causa de álcool e drogas. Como não podia terminar o show, um garoto subiu ao palco e tocou o restante da apresentação com a banda em seu lugar.
Esta banda de rock se apresentava totalmente nua no início da carreira. Os rapazes não usavam nada além de uma meia cobrindo as partes íntimas.
Este músico viajou de navio pelo Atlântico durante dez dias porque seu medo de voar o impedia de acompanhar o restante da banda no avião.
Esta lenda do rock começou sua turnê em 1988 e ainda não a terminou. Na “Never Ending Tour”, já fez mais de 2.600 shows.
Este cantor deixou seus colegas de banda na mão, no meio da criação de um novo álbum, porque queria participar do teste para o novo vocalista do Led Zeppelin.
Depois de sua apresentação no MTV Music Awards, este roqueiro cuspiu em um piano porque pensou que Axl Rose o tocaria mais tarde. Deu errado: o piano era de Elton John.''')
block('306','''O que é mais importante em uma música?
Se você fosse uma estrela do rock, como começariam seus shows?
Qual música descreve melhor seu dia?
Sua música tocaria no rádio?
Qual palavra descreve melhor seu estado de espírito?
Qual programa de TV você assiste quando está em um quarto de hotel?
Você prefere ouvir música…
Qual tema não poderia faltar de jeito nenhum na sua música?
Como seria sua viagem perfeita?
Para que você usaria sua fama de rockstar?''')
amap('''f8gfz|A balada de rock tranquila: todos os isqueiros para o alto
baz03|Claro que a música mais roqueira, e depois direto para a roda!
7l93b|O importante é tocarem seu maior sucesso para cantarmos junto a plenos pulmões!
a0jxu|Preferiria ouvir uma música nova, que nunca foi tocada ao vivo.
peiqe|… no bar, bêbado.
7xmqe|… no meio de tudo. Claro que você é o centro das atenções.
uqlhy|… um pouco afastado, observando tudo. Discutir com bêbados não adianta mesmo.
td556|… já foi embora, porque precisou carregar seu amigo bêbado para casa!
i79ew|Você impõe sua vontade. Seu gosto musical é o melhor mesmo.
18dwb|Você fica completamente fora da discussão. Tanto faz.
zs1rf|Você simplesmente ouve a música desconhecida. Talvez descubra músicas boas e novas para você.
n2m71|Vocês fazem um acordo: cada um pode colocar sua música por meia hora.
dpcea|Rock’n’roll sólido, com guitarras elétricas e muita força. A guitarra imaginária está pronta.
ovz59|Por que ainda produzem álbuns neste mundo digitalizado? Ninguém mais compra mesmo.
e5hhu|Um conceito com boas letras e grandes melodias, para os arrepios não passarem.
wsgdy|Música de bom humor, que você pode cantar alto no carro de janela aberta!
iqqz0|Algo que você nunca comeu. É preciso ampliar os horizontes.
iaa57|Você não vai junto. Acha bobagem: dá para comer em casa.
tl30x|Você come o que sempre pede ali. Pelo menos sabe que vai gostar!
2ehwq|Vocês pedem um prato enorme e todos comem dele. Assim, cada um pode provar tudo.
zfui3|Quando você está de bom humor, pode se soltar de verdade.
ohcki|Sempre que precisa de motivação. E vamos lá!
10ybe|Quando ninguém pode impedir você de cantar alto e desafinado.
20q24|Quando está de mau humor. Música é o melhor remédio contra o mau humor.
ct4uj|Você tem muitas ideias e primeiro não consegue decidir. Depois escolhe a fantasia mais maluca que consegue imaginar.
s91qt|Festa à fantasia? Você acha bobagem. Com certeza não vão encontrar você lá.
pgaxt|Você vai de Knight Rider ou Exterminador do Futuro. Algo muito legal!
tff9w|Festa à fantasia: sim. Mas com certeza nada cafona. Você vai de zumbi.
lz49q|Algo totalmente novo e experimental, que ninguém fez antes.
c0lkx|A mensagem é o mais importante!
9rwc3|Guitarras, vozes ásperas e volume!
pssav|Um bom riff de guitarra e um vocal capaz de arrepiar.
usqmg|A mensagem. As pessoas devem ser alertadas sobre os problemas do mundo.
h4omi|O volume. Rock precisa ser servido alto!
yz40n|A diversão. Sem boa música, também não há boa festa.
qjjp4|A composição. Todos os instrumentos e a voz juntos formam uma obra de arte única.
eah1c|Com certeza atrasados, porque ainda estou me divertindo com minhas groupies nos bastidores.
0qv81|Tudo escuro, depois ouvem apenas a mim e minha guitarra. Um momento de arrepiar.
px81g|Começaria logo com um estrondo, para a festa começar imediatamente.
ytzhd|Uma introdução carregada de significado, criando tensão, e depois a coisa pega fogo.
3ugkd|Na maioria dos países, com certeza seria proibida pela linguagem pesada. Escandaloso!
lkx1c|Claro, toca sem parar. Será um sucesso número um.
ygp2u|Sim, mas só na versão curta. Para ouvir os nove minutos completos, é preciso comprar o álbum.
9g07u|A mensagem crítica não agrada a todos, então provavelmente faria mais sucesso ao vivo.
296jt|Cheio de alegria de viver
6j79n|Disposto a aventuras
8w9im|Um debate político. Afinal, é preciso saber o que acontece no mundo.
wto4c|Tentaria invadir os canais codificados.
un2r7|Em algum lugar deve estar passando uma série de fantasia. Drama, diversão e suspense: exatamente o que gosto.
3kzto|Televisão me entedia. Só passa lixo mesmo.
8eijm|… nos dias em que você já está de bom humor. Com a música, a festa está sempre com você.
o19vt|… quando você está muito mal. Assim, pode se perder ainda mais na melancolia.
6umtw|… no carro, baixando as janelas e cantando alto junto.
pdnde|… sempre! Preciso de música 24 horas por dia, sete dias por semana.
6wnjn|Ela deveria abordar algo político.
vblcr|Com certeza precisa falar de liberdade de algum jeito.
qbi0n|O melhor seria levar as pessoas a pensar sobre si mesmas.
9yovc|De moto pelos Estados Unidos, para espairecer.
c7k80|Levar os amigos e ir de festival em festival. Com certeza, festa e bom humor.
ooxzr|Um pouco de cultura, talvez uma viagem a uma cidade. Afinal, também precisamos aprender e conhecer o mundo.
2f6nr|Para que viajar? Não preciso conhecer nada novo. Em casa me sinto melhor.
xtcva|Para entrar em todas as festas e conquistar mulheres. Para que mais?
ro6y0|Definitivamente para tornar o mundo um lugar melhor!
6abg8|Quero transmitir o amor pela música também às próximas gerações.
j4fe0|Toda essa fama irrita! Na verdade, só a música deveria importar.''')

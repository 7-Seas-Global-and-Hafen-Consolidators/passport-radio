import crypto from 'node:crypto';
import {promisify} from 'node:util';
import {fail} from '../services/errors.mjs';
import {tokenHash} from '../database/sqlite.mjs';
const scrypt=promisify(crypto.scrypt);
const publicUser=row=>row?{id:row.id,name:row.name,email:row.email}:null;
export function currentAccount(req,db){
  const token=String(req.headers.cookie||'').match(/(?:^|;\s*)passport_store_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  if(!token)return null;
  return publicUser(db.db.prepare('SELECT a.id,a.name,a.email FROM account_sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=? AND s.expires>?').get(tokenHash(token),Date.now()));
}
export function requireAccount(user){if(!user)fail('ACCOUNT_REQUIRED','Entre ou crie sua conta para finalizar o pedido.',401);return user;}
export async function accountAction(action,payload,req,db,env){
  if(action==='logout'){
    const token=String(req.headers.cookie||'').match(/passport_store_session=([a-f0-9]{64})/)?.[1];
    if(token)db.db.prepare('DELETE FROM account_sessions WHERE token_hash=?').run(tokenHash(token));
    return {data:{ok:true},cookie:'passport_store_session=; HttpOnly; Secure; SameSite=Lax; Path=/api/store; Max-Age=0'};
  }
  const email=String(payload.email||'').trim().toLowerCase(),password=String(payload.password||'');
  if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254||password.length<12||password.length>128)fail('INVALID_ACCOUNT','Informe e-mail válido e senha com 12 a 128 caracteres.');
  let row=db.db.prepare('SELECT * FROM accounts WHERE email=?').get(email);
  if(action==='register'){
    const name=String(payload.name||'').trim();
    if(name.length<2||name.length>150)fail('INVALID_ACCOUNT','Informe seu nome para criar a conta.');
    if(row)fail('ACCOUNT_EXISTS','Não foi possível criar essa conta. Entre com seu e-mail e senha.',409);
    const salt=crypto.randomBytes(16).toString('hex'),hash=(await scrypt(password,salt,64)).toString('hex');
    row={id:crypto.randomUUID(),email,name,password_hash:hash,password_salt:salt};
    db.db.prepare('INSERT INTO accounts VALUES(?,?,?,?,?,?)').run(row.id,email,name,hash,salt,Date.now());
  }else if(action==='login'){
    const hash=await scrypt(password,row?.password_salt||'passport-invalid-account-salt',64);
    if(!row||!crypto.timingSafeEqual(hash,Buffer.from(row.password_hash,'hex')))fail('INVALID_LOGIN','E-mail ou senha incorretos.',401);
  }else fail('INVALID_ACCOUNT_ACTION','Operação inválida.');
  const token=crypto.randomBytes(32).toString('hex');
  db.db.prepare('DELETE FROM account_sessions WHERE expires<?').run(Date.now());
  db.db.prepare('INSERT INTO account_sessions VALUES(?,?,?)').run(tokenHash(token),row.id,Date.now()+12*60*60*1000);
  // Local loopback is the sole non-TLS exception, used by isolated tests.
  const local=env.NODE_ENV==='test'&&['127.0.0.1','::1'].includes(req.socket.remoteAddress);
  return {data:{user:publicUser(row)},cookie:`passport_store_session=${token}; HttpOnly; ${local?'':'Secure; '}SameSite=Lax; Path=/api/store; Max-Age=43200`};
}

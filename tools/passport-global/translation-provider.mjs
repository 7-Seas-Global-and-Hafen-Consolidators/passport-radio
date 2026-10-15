// Server/build only. No credential or authenticated endpoint is sent to the browser.
import {checkedTranslation} from '../../js/passport-global/core.mjs';
export class TranslationProvider {
 constructor(env=process.env,transport=fetch){this.env=env;this.fetch=transport;}
 configured(){return !!(this.env.GOOGLE_CLOUD_PROJECT&&this.env.GOOGLE_CLOUD_ACCESS_TOKEN);}
 async translate(texts,locale){
  if(!['en-GB','es','fr','de'].includes(locale))throw Error('UNSUPPORTED_TARGET_LOCALE');
  if(!this.configured())throw Error('TRANSLATION_PROVIDER_NOT_CONFIGURED');
  const project=this.env.GOOGLE_CLOUD_PROJECT,region=this.env.GOOGLE_CLOUD_TRANSLATION_REGION||'us-central1';
  if(!/^[a-zA-Z0-9._:-]+$/.test(project)||!/^[-a-z0-9]+$/.test(region))throw Error('INVALID_TRANSLATION_PROJECT');
  const response=await this.fetch(`https://translation.googleapis.com/v3/projects/${project}/locations/${region}:translateText`,{method:'POST',headers:{Authorization:'Bearer '+this.env.GOOGLE_CLOUD_ACCESS_TOKEN,'x-goog-user-project':project,'Content-Type':'application/json'},body:JSON.stringify({sourceLanguageCode:'pt-BR',targetLanguageCode:locale,mimeType:'text/plain',model:`projects/${project}/locations/${region}/models/general/translation-llm`,contents:texts}),signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error('TRANSLATION_PROVIDER_HTTP_'+response.status);
  const body=await response.json();if(body.translations?.length!==texts.length)throw Error('INCOMPLETE_TRANSLATION_BATCH');
  return body.translations.map((v,i)=>checkedTranslation(texts[i],v.translatedText));
 }
}

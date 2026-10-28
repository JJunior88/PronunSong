const DB = 'pronunsong-library';
export async function openLibrary(factory = globalThis.indexedDB, name = DB) {
 if (!factory) throw Error('Este navegador não permite salvar músicas.');
 return new Promise((resolve,reject)=>{
  const request=factory.open(name,1);
  request.onupgradeneeded=()=>request.result.createObjectStore('songs',{keyPath:'id'});
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
  request.onblocked=()=>reject(Error('Feche outras janelas do app e tente novamente.'));
 });
}
export async function libraryOperation(action, value, factory, name) {
 const db=await openLibrary(factory,name);
 try{return await new Promise((resolve,reject)=>{
  const tx=db.transaction('songs',action==='list'?'readonly':'readwrite');
  const store=tx.objectStore('songs');
  const request=action==='list'?store.getAll():action==='save'?store.put(value):store.delete(value);
  let result;request.onsuccess=()=>{result=request.result;};
  tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Não foi possível salvar.'));
 });}finally{db.close();}
}
export const listSongs=()=>libraryOperation('list');
export const saveSong=song=>libraryOperation('save',song);
export const deleteSong=id=>libraryOperation('delete',id);

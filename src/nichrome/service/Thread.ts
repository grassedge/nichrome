module Nicr.Service {

    export class Thread extends Event {

        storage:Storage;
        idbManager: IDBManager;

        constructor(args:{
            idbManager: IDBManager;
        }) {
            super();
            this.storage = window.localStorage;
            this.idbManager = args.idbManager;
        }

        openThread(thread:Model.Thread) {
            this.emit('open:thread', {thread:thread});
            return this.fetchWithCache(thread);
        }

        closeThread(thread:Model.Thread) {
            this.emit('close:thread', {thread:thread});
            this.emit('close:thread:' + thread.id(), {thread:thread});
            // this.removeFromCache();
        }

        // ---- cache with indexedDB ----

        private saveToIDB(thread:Model.Thread, datText:string) {
            return this.idbManager.put(
                'Thread',
                {
                    id: [thread.boardKey, thread.threadKey],
                    threadKey: thread.threadKey,
                    boardKey: thread.boardKey,
                    datText: datText
                }
            ).fail((e) => {
                console.log('failed to save datText');
            });
        }

        private retrieveFromIDB(thread:Model.Thread):JQueryPromise<any> {
            return this.idbManager.get(
                'Thread', [thread.boardKey, thread.threadKey]
            ).then((result) => {
                return result ? Model.Comment.fromDatText(result.datText) : undefined;
            });
        }

        // ---- cache with local storage ----

        saveActiveTabToStorage(key:string) {
            this.storage.setItem('nicr:thread-tab-active', key);
        }

        retrieveActiveTabFromStorage():string {
            return this.storage.getItem('nicr:thread-tab-active');
        }

        saveTabToStorage(tab:Model.Thread[]) {
            this.storage.setItem('nicr:thread-tab', JSON.stringify(tab));
        }

        retrieveTabFromStorage():Model.Thread[] {
            var tab = this.storage.getItem('nicr:thread-tab');
            if (!tab) return [];
            return JSON.parse(tab).map((thread) => new Model.Thread(thread));
        }
    }
}
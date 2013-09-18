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

        fetch(thread:Model.Thread) {
            var url = thread.datUrl();
            return $.ajax(url, {
                mimeType: 'text/plain; charset=shift_jis'
            }).then((datText:string, status:string, $xhr:JQueryXHR) => {
                console.log($xhr.status);
                var comments = Model.Comment.fromDatText(datText);
                thread.commentCount = comments.length;
                // include datText for cache;
                var data = {thread:thread, comments:comments, datText:datText};
                this.emit('fetch:' + thread.id(), data);
                return data;
            });
        }

        private fetchAndCache(thread:Model.Thread) {
            return this.fetch(thread).then((data) => {
                this.saveToIDB(data.thread, data.datText);
            });
        }

        fetchWithCache(thread:Model.Thread, args:any = {}) {

            if (args.force) { return this.fetchAndCache(thread); }

            return this.retrieveFromIDB(thread).then((comments:Model.Comment[]) => {
                if (comments) {
                    var data = {thread:thread, comments:comments};
                    this.emit('fetch:' + thread.id(), data);
                    return data;
                }
                return this.fetchAndCache(thread);
            });
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
module Nicr.Service {

    export class Thread extends Event {

        storage:Storage;

        constructor() {
            super();
            this.storage = window.localStorage;
        }

        fetch(thread:Model.Thread) {
            var url = thread.datUrl();
            return $.ajax(url, {
                mimeType: 'text/plain; charset=shift_jis'
            }).then((datText:string) => {
                var comments = Model.Comment.fromDatText(datText);
                thread.commentCount = comments.length;
                var data = {thread:thread, comments:comments};
                this.emit('fetch:' + thread.id(), data);
                return data;
            });
        }

        fetchWithCache(thread:Model.Thread, args:any = {}) {
            // var threads = this.retrieveFromStorage(thread);
            // if (!args.force && threads) {
            //     this.emit('fetch:' + board.boardKey, threads);
            //     return $.Deferred().resolve(threads).promise();
            // } else {
                return this.fetch(thread).then((data) => {
                    // this.saveToStorage(board.boardKey, threads);
                });
            // }
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
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
    }
}
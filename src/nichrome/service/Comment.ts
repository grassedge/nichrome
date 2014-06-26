module Nicr.Service {

    export class Comment extends Event {

        idbManager: IDBManager;

        constructor(args:{
            idbManager: IDBManager;
        }) {
            super();
            this.idbManager = args.idbManager;
        }

        private fetch(thread:Model.Thread) {
            var url = thread.datUrl();
            return $.ajax(url, {
                mimeType: 'text/plain; charset=shift_jis'
            }).then((datText:string, status:number, $xhr:JQueryXHR):any => {
                var status = $xhr.status;
                console.log(status);
                if (status == 203) {
                    var expired = Model.Comment.parseExpiredDat(datText);
                    this.emit('fetch:expired', expired);
                    this.emit('fetch:expired:' + thread.boardKey, expired);
                    this.emit('fetch:expired:' + thread.id(), expired);
                    return expired;
                }
                var comments = Model.Comment.fromDatText(datText);
                thread.commentCount = comments.length;
                thread.datSize = comments.length;
                // include datText for cache;
                var data = {thread:thread, comments:comments, datText:datText};
                this.emit('fetch', data);
                this.emit('fetch:' + thread.boardKey, data);
                this.emit('fetch:' + thread.id(), data);
                return data;
            });
        }

        private fetchAndCache(thread:Model.Thread) {
            return this.fetch(thread).then((data:any) => { // ? why need 'any'
                if (!data.isExpired) this.saveToIDB(data.thread, data.datText);
                return data;
            });
        }

        fetchWithCache(thread:Model.Thread, args:any = {}) {

            if (args.force) { return this.fetchAndCache(thread); }

            return this.retrieveFromIDB(thread).then((comments:Model.Comment[]):any => {
                if (comments) {
                    var data = {thread:thread, comments:comments};
                    this.emit('fetch', data);
                    this.emit('fetch:' + thread.boardKey, data);
                    this.emit('fetch:' + thread.id(), data);
                    return data;
                }
                return this.fetchAndCache(thread);
            });
        }

        deleteDatLog(thread:Model.Thread) {
            return this.idbManager.delete(
                'Dat', [thread.boardKey, thread.threadKey]
            ).then(() => {
                this.emit('delete:dat', {thread:thread});
            });
        }

        // ---- cache with indexedDB ----

        private saveToIDB(thread:Model.Thread, datText:string) {
            return this.idbManager.put(
                'Dat',
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
                'Dat', [thread.boardKey, thread.threadKey]
            ).then((result) => {
                return result ? Model.Comment.fromDatText(result.datText) : undefined;
            });
        }

    }
}
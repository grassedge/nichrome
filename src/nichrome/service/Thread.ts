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

        private fetch(board:Model.Board):JQueryPromise<any> {
            var url = board.subjectUrl();
            this.emit('fetch:start', {board:board});
            this.emit('fetch:start:' + board.id(), {board:board});
            return $.ajax(url, {
                mimeType: 'text/plain; charset=shift_jis'
            }).then((subjectText) => {
                var threads = Model.Thread.fromSubjectText(subjectText);
                threads.forEach((thread) => {
                    thread.boardKey = board.boardKey;
                    thread.host = board.host;
                    thread.active = true;
                });
                board.threadSize = threads.length;
                var data = { board:board, threads:threads };
                this.emit('fetch', data);
                this.emit('fetch:' + board.boardKey, data);
                return data;
            });
        }

        private fetchAndCache(board:Model.Board) {
            return this.fetch(board).then((data) => {
                this.saveThreadsToIDB(data.board, data.threads);
                return data;
            });
        }

        fetchWithCache(board:Model.Board, args:any = {}) {

            if (board.boardKey === 'log') {
                return this.retrieveLogFromIDB().then((threads:Model.Thread[]) => {
                    var data = { board:board, threads:threads };
                    this.emit('fetch', data);
                    this.emit('fetch:' + board.boardKey, data);
                    return data;
                });
            }

            if (args.force) { return this.fetchAndCache(board); }

            return this.retrieveFromIDB(board).then((threads:Model.Thread[]) => {
                if (!!threads.length) {
                    var data = { board:board, threads:threads };
                    this.emit('fetch', data);
                    this.emit('fetch:' + board.boardKey, data);
                    return data;
                }
                return this.fetchAndCache(board);
            });
        }

        updateThreadDatSize(thread:Model.Thread) {
            return this.idbManager.update(
                'Thread', [thread.boardKey, thread.threadKey],
                {
                    datSize : thread.commentCount,
                    commentCount : thread.commentCount
                }
            );
        }

        deleteThreadLog(thread:Model.Thread) {
            return this.idbManager.search(
                'Thread', [thread.boardKey, thread.threadKey],
                {
                    success: (cursor) => {
                        var thread = cursor.value;
                        if (thread.active[1]) {
                            delete thread.datSize;
                            cursor.update(thread);
                        } else {
                            cursor.delete();
                        }
                    },
                    update: true
                }
            ).then(() => {
                this.emit('delete:log', {thread:thread});
                this.emit('close:thread', {thread:thread});
                this.emit('close:thread:' + thread.id(), {thread:thread});
            });
        }

        openThread(thread:Model.Thread) {
            this.emit('add:thread', {thread:thread});
            this.emit('select:thread', {thread:thread});
            this.saveActiveTabToStorage(thread.id());
        }

        selectThread(thread:Model.Thread) {
            this.emit('select:thread', {thread:thread});
            this.saveActiveTabToStorage(thread.id());
        }

        closeThread(thread:Model.Thread) {
            this.emit('close:thread', {thread:thread});
            this.emit('close:thread:' + thread.id(), {thread:thread});
        }

        // ---- cache with indexedDB ----

        private saveThreadsToIDB(board:Model.Board, threads:Model.Thread[]) {
            return this.idbManager.search(
                'Thread', [board.boardKey, 1], { indexName:'active' }
            ).then((data) => {
                var stored:IndexedList<Model.Thread> = new IndexedList(
                    data.map((thread) => new Model.Thread(thread))
                );

                var createList = [];
                var updateList = [];
                threads.forEach((thread) => {
                    var storedThread = stored.get(thread.id());
                    if (storedThread) {
                        updateList.push(thread);
                        var idx = stored.indexOf(storedThread);
                        stored.splice(idx, 1);
                    } else {
                        createList.push(thread);
                    }
                })

                var expireList = [];
                var deleteList = [];
                stored.getList().forEach((thread) => {
                    if (thread.datSize) expireList.push(thread)
                    else                deleteList.push(thread)
                });

                createList.map((thread) => {
                    return this.idbManager.put(
                        'Thread',
                        {
                            id: [thread.boardKey, thread.threadKey],
                            active: [thread.boardKey, 1],
                            threadKey: thread.threadKey,
                            boardKey: thread.boardKey,
                            host: thread.host,
                            title: thread.title,
                            commentCount: thread.commentCount,
                            number: thread.number,
                        }
                    ).fail((e) => {
                        console.log('failed to save datText');
                        console.log(e);
                    });
                });
                updateList.map((thread) => {
                    return this.idbManager.update(
                        'Thread', [thread.boardKey, thread.threadKey],
                        {
                            number : thread.number,
                            commentCount : thread.commentCount
                        }
                    );
                });
                expireList.map((thread) => {
                    this.idbManager.update(
                        'Thread', [thread.boardKey, thread.threadKey],
                        {
                            active : [thread.boardKey, 0],
                            number : undefined
                        }
                    )
                });
                deleteList.map((thread) => {
                    return this.idbManager.delete(
                        'Thread', [thread.boardKey, thread.threadKey]
                    );
                });

                return stored;
            });
        }

        private retrieveLogFromIDB():JQueryPromise<any> {
            return this.idbManager.search(
                'Thread', 1, { indexName:'datSize', condition:'gt' }
            ).then((threads) => {
                return threads.map((thread) => new Model.Thread(thread));
            });
        }

        private retrieveFromIDB(board:Model.Board):JQueryPromise<any> {
            return this.idbManager.search(
                'Thread', [board.boardKey, 1], { indexName:'active' }
            ).then((threads) => {
                // XXX refine when save 'sort key and order' to config.
                threads = threads.sort((a,b) => +(a.number) > +(b.number) ? 1 : -1);
                return threads.map((thread) => new Model.Thread(thread));
            });
        }

        // ---- cache with local storage ----

        private saveActiveTabToStorage(key:string) {
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
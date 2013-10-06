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
                this.saveToStorage(data.board.boardKey, data.threads);
                this.saveThreadsToIDB(data.board, data.threads);
                return data;
            });
        }

        fetchWithCache(board:Model.Board, args:any = {}) {

            if (args.force) { return this.fetchAndCache(board); }

            var threads = this.retrieveFromStorage(board);
            if (threads) {
                var data = { board:board, threads:threads };
                this.emit('fetch', data);
                this.emit('fetch:' + board.boardKey, data);
                return $.Deferred().resolve(data).promise();
            } else {
                return this.fetchAndCache(board);
            }
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

        private saveThreadsToIDB(board:Model.Board, threads:Model.Thread[]) {
            this.idbManager.search(
                'Thread', [board.boardKey, 1], { indexName:'active' }
            ).then((data) => {
                var stored:IndexedList<Model.Thread> = new IndexedList(
                    data.map((thread) => new Model.Thread(thread))
                );

                console.log(stored);

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

                console.log(createList);
                console.log(updateList);
                console.log(expireList);
                console.log(deleteList);

                createList.map((thread) => {
                    return this.idbManager.put(
                        'Thread',
                        {
                            id: [thread.boardKey, thread.threadKey],
                            active: [thread.boardKey, 1],
                            threadKey: thread.threadKey,
                            boardKey: thread.boardKey,
                            title: thread.title,
                            number: thread.number,
                        }
                    ).fail((e) => {
                        console.log('failed to save datText');
                        console.log(e);
                    });
                });
                // expireList.map((thread) => {
                //     this.idbManager.search(
                //         'Thread', [thread.boardKey, thread.threadKey],
                //         {
                //             success: () => {
                //             }
                //         }
                //     )
                // });
                deleteList.map((thread) => {
                    return this.idbManager.delete(
                        'Thread', [thread.boardKey, thread.threadKey]
                    );
                });

                return stored;
            });

            var thread = threads[0];
            return this.idbManager.put(
                'Thread',
                {
                    id: [thread.boardKey, thread.threadKey],
                    active: [thread.boardKey, 1],
                    threadKey: thread.threadKey,
                    boardKey: thread.boardKey,
                    title: thread.title,
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

        private saveToStorage(boardKey:string, threads:Model.Thread[]) {
            this.storage.setItem('nicr:board-' + boardKey, JSON.stringify(threads));
        }

        private retrieveFromStorage(board:Model.Board):Model.Thread[] {
            var cache = this.storage.getItem('nicr:board-' + board.boardKey);
            if (!cache) return;
            return JSON.parse(cache).map((thread) => new Model.Thread(thread));
        }

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
/// <reference path="../Event.ts" />
/// <reference path="../model/Board.ts" />
/// <reference path="../model/Thread.ts" />

module Nicr.Service {

    export class Board extends Event {

        storage:Storage;

        constructor() {
            super();
            this.storage = window.localStorage;
        }

        fetch(board:Model.Board):JQueryPromise<any> {
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
                this.emit('fetch', { board:board, threads:threads });
                this.emit('fetch:' + board.boardKey, threads);
                return threads;
            });
        }

        fetchWithCache(board:Model.Board, args:any = {}) {
            var threads = this.retrieveFromStorage(board);
            if (!args.force && threads) {
                this.emit('fetch:' + board.boardKey, threads);
                return $.Deferred().resolve(threads).promise();
            } else {
                return this.fetch(board).then((threads) => {
                    this.saveToStorage(board.boardKey, threads);
                });
            }
        }

        openBoard(board:Model.Board) {
            this.emit('add:board', {board:board});
            this.emit('select:board', {board:board});
            this.fetchWithCache(board);
            this.saveActiveTabToStorage(board.id());
        }

        selectBoard(board:Model.Board) {
            this.emit('select:board', {board:board});
            this.saveActiveTabToStorage(board.id());
        }

        reloadActiveBoard() {
            this.emit('reload:board:active', {});
        }

        closeBoard(board:Model.Board) {
            this.emit('close:board', {board:board});
            this.emit('close:board:' + board.boardKey, {board:board});
            this.removeFromCache(board);
        }

        // ---- cache with local storage ----

        private saveToStorage(boardKey:string, threads:Model.Thread[]) {
            this.storage.setItem('nicr:board-' + boardKey, JSON.stringify(threads));
        }

        retrieveFromStorage(board:Model.Board):Model.Thread[] {
            var cache = this.storage.getItem('nicr:board-' + board.boardKey);
            if (!cache) return;
            return JSON.parse(cache).map((thread) => new Model.Thread(thread));
        }

        private removeFromCache(board:Model.Board) {
            delete this.storage.removeItem('nicr:board-' + board.boardKey);
        }

        private saveActiveTabToStorage(boardKey:string) {
            this.storage.setItem('nicr:board-tab-active', boardKey);
        }

        retrieveActiveTabFromStorage():string {
            return this.storage.getItem('nicr:board-tab-active');
        }

        saveTabToStorage(tab:Model.Board[]) {
            this.storage.setItem('nicr:board-tab', JSON.stringify(tab));
        }

        retrieveTabFromStorage():Model.Board[] {
            var tab = this.storage.getItem('nicr:board-tab');
            if (!tab) return [];
            return JSON.parse(tab).map((board) => new Model.Board(board));
        }
    }
}
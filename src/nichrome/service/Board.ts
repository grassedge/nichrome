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

        openBoard(board:Model.Board) {
            this.emit('add:board', {board:board});
            this.emit('select:board', {board:board});
            this.saveActiveTabToStorage(board.id());
        }

        selectBoard(board:Model.Board) {
            this.emit('select:board', {board:board});
            this.saveActiveTabToStorage(board.id());
        }

        closeBoard(board:Model.Board) {
            this.emit('close:board', {board:board});
            this.emit('close:board:' + board.boardKey, {board:board});
            this.removeFromCache(board);
        }

        // ---- cache with local storage ----

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
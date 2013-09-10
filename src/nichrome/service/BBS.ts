/// <reference path="../Util.ts" />
/// <reference path="../Event.ts" />
/// <reference path="../model/Board.ts" />

module Nicr.Service {

    export class BBS extends Event {

        storage:Storage;

        constructor() {
            super();
            this.storage = window.localStorage;
        }

        url():string {
            return 'http://menu.2ch.net/bbsmenu.html';
        }

        fetch() {
            return $.get(this.url()).then((html) => {
                var boards = new IndexedList();
                var categories = html.match(/<BR><BR><B>([\s\S]+?)\s\s/g)

                categories = categories.map((data) => {
                    return $('<div>' + data.replace(/>/g, ' >') + '</div>');
                }).map(($category) => {
                    var category = { name:$category.find('b').text(), boards:[] };
                    $category.find('a').each((idx, elm) => {
                        var raw = {
                            title: $(elm).text(),
                            url  : $(elm).attr('href')
                        };
                        var board = new Model.Board(raw);
                        category.boards.push(board);
                        if (board.boardKey) boards.push(board);
                    });
                    return category;
                });

                this.emit('fetch', {
                    categories : categories,
                    boards     : boards
                });

                return { categories:categories, boards:boards };

            }).fail((err) => {
                // dat 落ち・削除済みの判断
                alert('fail to fetch bbs list');
            });
        }

        fetchWithCache(args:any = {}) {
            var data = this.retrieveFromStorage();
            if (!args.force && data) {
                this.emit('fetch', data);
                return $.Deferred().resolve(data).promise();
            } else {
                return this.fetch().then((data) => {
                    this.saveToStorage(data);
                    return data;
                });
            }
        }

        saveToStorage(data) {
            var categories = data.categories;
            var boards     = data.boards;
            this.storage.setItem('nicr:categories', JSON.stringify(categories));
            this.storage.setItem('nicr:boards', JSON.stringify(boards.getList()));
        }

        retrieveFromStorage() {
            var categories = this.storage.getItem('nicr:categories');
            var boards     = this.storage.getItem('nicr:boards');
            if (!categories) return;
            categories = JSON.parse(categories);
            boards = new IndexedList(
                JSON.parse(boards).map((value) => new Model.Board(value))
            );
            return {
                categories : categories,
                boards     : boards,
                isCache    : true
            };
        }
    }
}

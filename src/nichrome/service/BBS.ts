/// <reference path="../Event.ts" />

module Nicr.Service {

    export class BBS extends Event {

        url():string {
            return 'http://menu.2ch.net/bbsmenu.html';
        }

        fetch() {
            return $.get(this.url()).then((html) => {
                var bbsData = html.match(
                        /<BR><BR><B>([\s\S]+?)\s\s/g
                ).map((data) => {
                    return $('<div>' + data.replace(/>/g, ' >') + '</div>');
                }).map(($category) => {
                    var boards = [];
                    $category.find('a').each((idx, elm) => {
                        boards.push({
                            title: $(elm).text(),
                            url  : $(elm).attr('href')
                        });
                    });
                    return {
                        name   : $category.find('b').text(),
                        boards : boards
                    };
                });

                this.emit('fetch', {bbsData:bbsData});
                return bbsData;

            }).fail((err) => {
                alert('fail to fetch bbs list');
            });
        }

        fetchWithCache() {
            var cache = localStorage.getItem('BBS');
            if (cache) {
                var bbsData = JSON.parse(cache);
                this.emit('fetch', { bbsData:bbsData, isCache:true });
                return $.Deferred().resolve(bbsData).promise();
            } else {
                return this.fetch().then((bbsData) => {
                    localStorage.setItem('BBS', JSON.stringify(bbsData));
                    return bbsData;
                });
            }
        }
    }
}
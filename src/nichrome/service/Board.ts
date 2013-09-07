/// <reference path="../Event.ts" />
/// <reference path="../model/Thread.ts" />

module Nicr.Service {

    export class Board extends Event {

        private parse2chUrl(url:string) {
            var match = url.match(/\/\/([^\/]+\.2ch\.net)\/([^\/]+)\//);
            if (!match) return;
            return {
                host: match[1],
                boardKey: match[2]
            }
        }

        assembleSubjectUrl(host:string, boardKey:string):string {
            return 'http://' + host + '/' + boardKey + '/' + 'subject.txt';
        }

        fetch(host:string, boardKey:string) {
            var url = this.assembleSubjectUrl(host, boardKey);
            return $.get(url).then((subjectText) => {
                var threads = Model.Thread.fromSubjectText(subjectText);
                this.emit('fetch', threads);
                return subjectText;
            });
        }

        openBoard(url:string) {
            var parsed = this.parse2chUrl(url);
            if (!parsed) {
                window.open(url);
                return;
            }
            this.emit('open:board', parsed);
            return this.fetch(parsed.host, parsed.boardKey);
        }
    }
}
module Nicr.Model {

    export class Board {

        boardKey:string;
        title:string;
        host:string;
        url:string;
        threadSize:number;

        constructor(args:{
            boardKey?:string;
            title:string;
            host?:string;
            url?:string;
            threadSize?:number;
        }) {
            this.boardKey   = args.boardKey;
            this.title      = args.title;
            this.host       = args.host;
            this.url        = args.url;
            this.threadSize = args.threadSize;
            if (args.url) {
                var parsed = this.parse2chUrl(args.url);
                if (parsed) {
                    this.boardKey = parsed.boardKey;
                    this.host = parsed.host;
                } else {
                    this.url = args.url
                }
            }
        }

        private parse2chUrl(url:string) {
            var match = url.match(/\/\/([^\/]+\.2ch\.net)\/([^\/]+)\//);
            if (!match) return;
            return {
                host: match[1],
                boardKey: match[2]
            }
        }

        subjectUrl():string {
            return this.boardUrl() + 'subject.txt';
        }

        boardUrl():string {
            return this.url || ('http://' + this.host + '/' + this.boardKey + '/');
        }

        id():string {
            return this.boardKey;
        }

        equals(other:Board):boolean {
            if (!other) return false;
            return this.id() === other.id();
        }
    }
}

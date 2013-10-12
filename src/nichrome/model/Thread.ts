module Nicr.Model {

    export class Thread {

        boardKey:string;
        threadKey:number;
        title:string;
        host:string;
        commentCount:number;
        number:number;
        momentum:number;
        datSize:number;
        active: boolean;
        isNew: boolean;

        constructor(args) {
            this.boardKey     = args.boardKey;
            this.threadKey    = args.threadKey;
            this.title        = args.title;
            this.host         = args.host;
            this.commentCount = args.commentCount;
            this.datSize      = args.datSize;
            this.number       = args.number;
            this.isNew        = args.isNew;
            this.active       = !(args.active instanceof Array) ? args.active
                              : args.active[1] ? true : false;
            this.momentum = this.calcMomentum();
        }

        static fromSubjectText(txt:string):Thread[] {
            var lines = txt.split(/\n/).filter((item) => { return item !== '' });
            return lines.map((line, idx) => {
                return new Thread(Thread.parseLine(line, idx + 1))
            });
        }

        private static parseLine(line:string, idx:number) {
            var matched = line.match(/^(\d*?)\.dat<>(.*?) \((\d*?)\)/);
            return {
                threadKey    : matched[1],
                title        : matched[2],
                commentCount : matched[3],
                'number'     : idx
            };
        }

        threadUrl() {
            return 'http://' + this.host +
                '/test/read.cgi/' + this.boardKey +
                '/' + this.threadKey + '/';
        }

        datUrl():string {
            return 'http://' + this.host +
                '/' + this.boardKey +
                '/dat/' + this.threadKey + '.dat';
        }

        calcMomentum():number {
            var epoch = new Date().getTime();
            var elapse = (epoch - this.threadKey * 1000) / 1000 || 1;
            return Math.floor(24 * 60 * 60 * this.commentCount / elapse);
        }

        logRate():number {
            if (!this.datSize) return;
            return Math.floor(this.datSize * 100 / this.commentCount);
        }

        equals(other:Thread):boolean {
            if (!other) return false;
            return this.id() === other.id();
        }

        id() {
            return this.boardKey + '-' + this.threadKey;
        }
    }

}

module Nicr.Model {

    export class Thread {

        boardKey:string;
        threadKey:number;
        title:string;
        host:string;
        commentCount:number;
        number:number;
        momentum:number;

        constructor(args) {
            for (var key in args) this[key] = args[key];
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

        equals(other:Thread):boolean {
            if (!other) return false;
            return this.id() === other.id();
        }

        id() {
            return this.boardKey + '-' + this.threadKey;
        }
    }

}

module Nicr.Model {

    export class Thread {

        threadKey;
        boardKey;
        title;
        commentCount;
        number;
        active;

        constructor(args) {
            for (var key in args) this[key] = args[key];
        }

        static fromSubjectText(txt:string) {
            var lines = txt.split(/\n/).filter((item) => { return item !== '' });
            return lines.map((line, idx) => Thread.parseLine(line, idx + 1));
        }

        private static parseLine(line:string, idx:number) {
            var matched = line.match(/^(\d*?)\.dat<>(.*?) \((\d*?)\)/);
            return new Thread({
                threadKey    : matched[1],
                title        : matched[2],
                commentCount : matched[3],
                'number'     : idx
            });
        }

        calcMomentum() {
            var epoch = new Date().getTime();
            var elapse = (epoch - this.threadKey * 1000) / 1000 || 1;
            return Math.floor(24 * 60 * 60 * this.commentCount / elapse);
        }

        savePath(boardKey, threadKey) {
            return 'dat/' + boardKey + '/' + threadKey + '.dat';
        }
    }

}

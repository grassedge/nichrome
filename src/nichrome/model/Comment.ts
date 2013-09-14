module Nicr.Model {
    export class Comment {

        name: string;
        mail: string;
        createdAt: string;
        authorId: string;
        body: string;
        title: string;
        number: number;

        private static LINK_REGEXP =
            /(\b(h?ttps?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

        constructor(args) {
            for (var key in args) this[key] = args[key];
        }

        static fromDatText(datText:string):Comment[] {
            var lines = datText.toString().split(/\n/).filter((item) => (item !== ''));
            return lines.map((line, idx) => {
                var comment = Comment.parseLine(line);
                comment['number'] = idx + 1;
                return new Comment(comment);
            });
        }

        private static parseLine(line:string) {
            var split = line.split(/<>/);
            var name  = split[0];
            var mail  = split[1];
            var meta  = split[2];
            var body  = split[3];
            var title = split[4];
            split = meta.split(/ /);
            var createdAt = split[0] + ' ' + split[1];
            var authorId  = (split[2] || '').substr(3);
            var beId      = split[3];
            return {
                name: name,
                mail: mail,
                createdAt: createdAt,
                authorId: authorId,
                body: body,
                title: title
            };
        }

        replacedBody():string {
            return this.body.replace(
                Comment.LINK_REGEXP,
                function(whole, path, suffix) {
                    var full = (whole[0] == 'h' ? '' : 'h') + whole;
                    return whole.match(/(jpeg|jpg|png|gif)$/)
                        ? '<div><img class="image" src="' + full + '" /></div>'
                        : '<a href="' + full + '" class="autolink" target="_blank">'
                        + whole + '</a>';
                }
            );
        }

        id():string {
            return this.number + '';
        }
    }
}
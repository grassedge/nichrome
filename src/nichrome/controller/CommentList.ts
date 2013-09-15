/// <reference path="../service/Thread.ts" />

module Nicr.Controller {

    export class CommentList {

        private $el: JQuery;
        private thread: Model.Thread;
        private comments: IndexedList<Model.Comment>;

        private threadService: Service.Thread;

        constructor(args:{
            $el:JQuery;
            thread:Model.Thread;
            threadService:Service.Thread;
        }) {
            this.$el = args.$el;
            this.thread = args.thread;
            this.threadService = args.threadService;

            this.threadService.on('fetch:' + this.thread.id(), (e) => { this.onFetch(e) });
            this.threadService.on('close:thread:' + this.thread.id(), (e) => { this.onClose(e) });
        }

        private render() {
            var html = JST['comment-list']({comments:this.comments});
            this.$el.find('.comment-list').html(html);
        }

        private onFetch(event) {
            this.comments = new IndexedList(event.comments);
            this.thread = event.thread;
            this.render();
        }

        private onClose(event) {
            this.threadService.off('fetch:' + this.thread.id());
            this.threadService.off('close:thread:' + this.thread.id());
            this.$el.remove();
        }
    }

}

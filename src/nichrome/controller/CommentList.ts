/// <reference path="../service/Thread.ts" />

module Nicr.Controller {

    export class CommentList {

        private $el: JQuery;
        private thread: Model.Thread;
        private comments: IndexedList<Model.Comment>;

        private threadService: Service.Thread;
        private commentService: Service.Comment;

        constructor(args:{
            $el:JQuery;
            thread:Model.Thread;
            threadService:Service.Thread;
            commentService:Service.Comment;
        }) {
            this.$el = args.$el;
            this.thread = args.thread;
            this.threadService = args.threadService;
            this.commentService = args.commentService;

            this.threadService.on('close:thread:' + this.thread.id(), (e) => { this.onClose(e) });
            this.commentService.on('fetch:' + this.thread.id(), (e) => { this.onFetch(e) });

            this.$el.on('click', '.comment-list-up-button', (e) => { this.onUpButton(e) });
            this.$el.on('click', '.comment-list-down-button', (e) => { this.onDownButton(e) });
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
            this.threadService.off('close:thread:' + this.thread.id());
            this.commentService.off('fetch:' + this.thread.id());
            this.$el.remove();
        }

        private onUpButton(event) {
            this.$el.find('.comment-list').scrollTop(0);
        }

        private onDownButton(event) {
            this.$el.find('.comment-list').scrollTop(10000000000); // irresponsible
        }

    }

}

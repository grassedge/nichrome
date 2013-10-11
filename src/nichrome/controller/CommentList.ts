/// <reference path="../service/Thread.ts" />

module Nicr.Controller {

    export class CommentList {

        private $el: JQuery;
        private $tabItem: JQuery;
        private thread: Model.Thread;
        private comments: IndexedList<Model.Comment>;

        private threadService: Service.Thread;
        private commentService: Service.Comment;

        constructor(args:{
            $el:JQuery;
            $tabItem:JQuery;
            thread:Model.Thread;
            threadService:Service.Thread;
            commentService:Service.Comment;
        }) {
            this.$el = args.$el;
            this.$tabItem = args.$tabItem;
            this.thread = args.thread;
            this.threadService = args.threadService;
            this.commentService = args.commentService;

            this.threadService.on('close:thread:' + this.thread.id(), (e) => { this.onClose(e) });
            this.commentService.on('fetch:' + this.thread.id(), (e) => { this.onFetch(e) });

            this.$el.on('click', '.comment-list-up-button', (e) => { this.onClickUpButton(e) });
            this.$el.on('click', '.comment-list-down-button', (e) => { this.onClickDownButton(e) });
            this.$tabItem.on('click', (e) => { this.onClickThreadTabItem(e) });
            this.$tabItem.on('click', '.close-button', (e) => { this.onClickCloseButton(e) });
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
            this.$tabItem.remove();
        }

        private onClickUpButton(event) {
            this.$el.find('.comment-list').scrollTop(0);
        }

        private onClickDownButton(event) {
            this.$el.find('.comment-list').scrollTop(10000000000); // irresponsible
        }

        private onClickThreadTabItem(event) {
            if ($(event.target).hasClass('close-button')) return;
            this.threadService.selectThread(this.thread);
        }

        private onClickCloseButton(event) {
            this.threadService.closeThread(this.thread);
        }

    }

}

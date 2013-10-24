/// <reference path="../service/Thread.ts" />

interface JQuery {
    lazyload(...args:any[]): JQuery;
}

module Nicr.Controller {

    export class CommentList {

        private $el: JQuery;
        private $tabItem: JQuery;
        private thread: Model.Thread;
        private comments: IndexedList<Model.Comment>;

        private threadService: Service.Thread;
        private commentService: Service.Comment;
        private handlers: any = {};

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

            var handlers = this.handlers;
            handlers.onFetchThread = (e) => { this.onFetchThread(e) };

            this.threadService.on('close:thread:' + this.thread.id(), (e) => { this.onClose(e) });
            this.threadService.on('fetch:' + this.thread.boardKey, handlers.onFetchThread);
            this.commentService.on('fetch:' + this.thread.id(), (e) => { this.onFetch(e) });
            this.commentService.on('fetch:expired:' + this.thread.id(), (e) => { this.onFetchExpired(e) });

            this.$el.on('click', '.comment-list-up-button', (e) => { this.onClickUpButton(e) });
            this.$el.on('click', '.comment-list-down-button', (e) => { this.onClickDownButton(e) });
            this.$el.on('click', '.comment-list-link-button', (e) => { this.onClickLinkButton(e) });
            this.$el.on('click', '.comment-list-image-button', (e) => { this.onClickImageButton(e) });
            this.$tabItem.on('click', (e) => { this.onClickThreadTabItem(e) });
            this.$tabItem.on('dblclick', (e) => { this.onDblClickThreadTabItem(e) });
            this.$tabItem.on('click', '.close-button', (e) => { this.onClickCloseButton(e) });
        }

        private render() {
            var html = JST['comment-list']({comments:this.comments});
            var $commentList = this.$el.find('.comment-list');
            $commentList.html(html);
            // I'd like to delegate to $commentList.
            $commentList.find('.image').lazyload({
                container: $commentList,
                effect: 'fadeIn'
            });
        }

        private updateTabItem() {
            var $newItem = $(JST['thread-tab-item']({thread:this.thread}));
            this.$tabItem.empty().append($newItem.children());
            this.$tabItem.toggleClass('active', this.thread.active);
            this.$tabItem.toggleClass('expired', !this.thread.active);
        }

        private renderExpired(expired) {
            var html = JST['comment-expired']({expired:expired});
            var $commentList = this.$el.find('.comment-list');
            $commentList.html(html);
            // I'd like to delegate to $commentList.
            $commentList.find('.image').lazyload({
                container: $commentList,
                effect: 'fadeIn'
            });
        }

        private onFetchThread(event) {
            var threads = event.threads;
            var thread;
            // XXX linear scan is high cost. fix algorithm.
            for (var i = 0, len = threads.length; i < len; i++) {
                if (this.thread.equals(threads[i])) {
                    thread = threads[i];
                    break;
                }
            }
            if (thread) {
                this.thread.active = thread.active;
                this.thread.commentCount = thread.commentCount;
            } else {
                this.thread.active = false;
            }
            this.updateTabItem();
        }

        private onFetch(event) {
            this.comments = new IndexedList(event.comments);
            this.thread = event.thread;
            this.render();
            this.updateTabItem();
        }

        private onFetchExpired(event) {
            if (!this.comments) {
                // XXX refine design and specification.
                //     it's better to save thread to IDB even if it was expired.
                this.renderExpired(event);
            }

            var $dialog = $(JST['comment-expired-dialog']());
            this.$el.append($dialog);
            $dialog.hide().fadeIn(250, () => {
                setTimeout(() => {
                    $dialog.fadeOut(250, () => { $dialog.remove() });
                }, 1500)
            });

            this.$tabItem.removeClass('active');
            this.$tabItem.addClass('expired');
            this.thread.active = false;
            this.threadService.updateExpired(this.thread);
        }

        private onClose(event) {
            this.threadService.off('close:thread:' + this.thread.id());
            this.threadService.off('fetch:' + this.thread.boardKey, this.handlers.onFetchThread);
            this.commentService.off('fetch:' + this.thread.id());
            this.commentService.off('fetch:expired:' + this.thread.id());
            this.$el.remove();
            this.$tabItem.remove();
        }

        private onClickUpButton(event) {
            this.$el.find('.comment-list').scrollTop(0);
        }

        private onClickDownButton(event) {
            this.$el.find('.comment-list').scrollTop(10000000000); // irresponsible
        }

        private onClickLinkButton(event) {
            var $button = $(event.currentTarget);
            var $comments = this.$el.find('.comment');
            if ($button.hasClass('on')) {
                $comments.show();
                $button.removeClass('on');
            } else {
                $comments.each((idx, el) => {
                    this.comments.at(idx).hasLink() ? $(el).show() : $(el).hide();
                });
                $button.parent().find('.on').removeClass('on');
                $button.addClass('on');
            }
        }

        private onClickImageButton(event) {
            var $button = $(event.currentTarget);
            var $comments = this.$el.find('.comment');
            if ($button.hasClass('on')) {
                $comments.show();
                $button.removeClass('on');
            } else {
                $comments.each((idx, el) => {
                    this.comments.at(idx).hasImage() ? $(el).show() : $(el).hide();
                });
                $button.parent().find('.on').removeClass('on');
                $button.addClass('on');
            }
        }

        private onClickThreadTabItem(event) {
            if ($(event.target).hasClass('close-button')) return;
            this.threadService.selectThread(this.thread);
        }

        private onDblClickThreadTabItem(event) {
            this.commentService.fetchWithCache(this.thread, {force:true});
        }

        private onClickCloseButton(event) {
            this.threadService.closeThread(this.thread);
        }

    }

}

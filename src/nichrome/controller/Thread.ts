/// <reference path="../service/Thread.ts" />

module Nicr.Controller {

    export class Thread {

        private $el: JQuery;

        private tabModels: IndexedList<Model.Thread>;
        private activeThread: Model.Thread;

        private threadService: Service.Thread;

        constructor(args:{
            $el:JQuery;
            threadService:Service.Thread;
        }) {
            this.$el = args.$el;
            this.threadService = args.threadService;
            this.tabModels = new IndexedList();

            this.threadService.on('open:thread', (e) => { this.onOpenThread(e) });

            this.$el.on('click', '.thread-tab-item', (e) => { this.onClickThreadTabItem(e) });
        }

        private addThread(thread:Model.Thread) {
            if (this.tabModels.get(thread.id())) return;
            this.tabModels.push(thread);
            var tabItemHtml = JST['thread-tab-item']({thread:thread});
            var threadHtml = JST['thread']({thread:thread});
            this.$el.find('.thread-tab').append(tabItemHtml);
            this.$el.find('.thread-content').append(threadHtml);
            new CommentList({
                $el:this.$el.find('#thread-' + thread.id()),
                thread:thread,
                threadService:this.threadService
            });
        }

        private selectThread(thread:Model.Thread) {
            this.setThreadTitle(thread);

            var originalThread = this.activeThread;
            if (thread.equals(originalThread)) return;
            this.activeThread = thread;
            this.$el.find('#thread-tab-' + thread.id()).addClass('selected');
            this.$el.find('#thread-' + thread.id()).show();
            if (!originalThread) return;
            this.$el.find('#thread-tab-' + originalThread.id()).removeClass('selected');
            this.$el.find('#thread-' + originalThread.id()).hide();
        }

        private setThreadTitle(thread:Model.Thread) {
            var html = JST['thread-header']({thread:thread});
            this.$el.find('.header-center').html(html);
        }

        private onOpenThread(event) {
            var thread = event.thread;
            this.addThread(thread);
            this.selectThread(thread);
        }

        private onClickThreadTabItem(event) {
            var $tabItem = $(event.currentTarget);
            var key = $tabItem.attr('id').match(/^thread-tab-(.+?)$/)[1];
            var thread = this.tabModels.get(key);
            this.selectThread(thread);
        }

        private onDblclickThreadTabItem(event) {
            var $tabItem = $(event.currentTarget);
            var key = $tabItem.attr('id').match(/^thread-tab-(.+?)$/)[1];
            var thread = this.tabModels.get(key);
            this.threadService.closeThread(thread);
        }
    }

    export class ThreadTab {
        
    }

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
    }
}
/* 主角画像的表情：哪位主角、有哪几种表情的头像已经画好放进 art/ 了，就写在这里。
   文件名是 art/<id>_face_<表情>.jpg，和 <id>_face.jpg 一样大（760×868）。表情的代号：xiao 笑、nu 怒、an 黯然、jing 惊。
   例：window.JX_MOODS = { jingzhe: ['xiao', 'nu', 'an'], qiushui: ['xiao', 'an'] };
   没写的就用平常那一张。剧本里的 [笑][嬉] 用 xiao，[怒] 用 nu，[黯][闭] 用 an，[惊] 用 jing。 */
window.JX_MOODS = {};

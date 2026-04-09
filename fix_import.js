const fs = require('fs');
const path = 'src/views/article/detail/index.vue';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  "import CommentItem from '@/components/comment/CommentItem.vue'",
  "import EPicker from '@/components/base/EPicker/index.vue'\nimport CommentItem from '@/components/comment/CommentItem.vue'"
);
content = content.replace(
  "import { useUserStore } from '@/stores/user'",
  "function handleEmojiSelect(emoji: string) {\n  commentContent.value += emoji\n}\n\nimport { useUserStore } from '@/stores/user'"
);
fs.writeFileSync(path, content);
console.log('Done');
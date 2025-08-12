# 数据库设计

## 数据表结构

### users (用户表)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### memory_records (记忆记录表)
```sql
CREATE TABLE memory_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title VARCHAR(200),
  content TEXT NOT NULL,
  mood INTEGER CHECK(mood >= 1 AND mood <= 5), -- 1-5 心情评分
  tags TEXT, -- JSON格式存储标签
  ai_analysis TEXT, -- AI对当前记录的分析
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### conversations (对话表)
```sql
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  memory_record_id INTEGER NOT NULL,
  conversation_data TEXT NOT NULL, -- JSON格式存储对话历史
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (memory_record_id) REFERENCES memory_records(id) ON DELETE CASCADE
);
```

### thought_analysis (思想分析表)
```sql
CREATE TABLE thought_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  analysis_type VARCHAR(50) NOT NULL, -- 'growth', 'change', 'pattern'
  time_range VARCHAR(50), -- '1year', '2years', 'all'
  analysis_result TEXT NOT NULL, -- JSON格式存储分析结果
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 数据关系

- 一个用户可以有多个记忆记录
- 一个记忆记录可以有多个对话会话
- 一个用户可以有多个思想分析结果
- 所有表都与用户表有外键关联，实现数据隔离
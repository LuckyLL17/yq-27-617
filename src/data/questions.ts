import { Question } from '../types';

export const questions: Question[] = [
  // ========== Java 题目 ==========
  {
    id: 'java-1',
    title: 'HashMap的底层原理是什么？',
    categoryId: 'java',
    difficulty: 'medium',
    content: '请详细描述HashMap的底层数据结构，以及put和get操作的执行流程。JDK1.7和1.8有什么区别？',
    standardSolution: `HashMap底层采用数组+链表+红黑树的结构实现。

**核心数据结构：**
- 数组（桶数组）：存储链表或红黑树的头节点
- 链表：解决哈希冲突，当链表长度超过阈值(8)且数组长度大于64时转为红黑树
- 红黑树：优化链表过长时的查询效率

**put操作流程：**
1. 计算key的hash值（hash = (h = key.hashCode()) ^ (h >>> 16)）
2. 通过 (n - 1) & hash 计算数组下标
3. 如果该位置为空，直接插入新节点
4. 如果该位置有元素，遍历链表/红黑树：
   - key相同则覆盖value
   - key不同则追加到链表尾部
5. 插入后检查size是否超过阈值（capacity * loadFactor），超过则扩容（2倍）

**JDK1.7 vs 1.8区别：**
1. 1.7：数组+链表，头插法，扩容时会反转链表顺序（并发下可能成环）
2. 1.8：数组+链表+红黑树，尾插法，扩容时保持链表顺序`,
    pitfalls: [
      {
        title: '并发环境下的死循环问题',
        description: 'JDK1.7的HashMap在并发扩容时，由于采用头插法，可能导致链表成环，引发死循环（CPU 100%）。虽然1.8改用尾插法解决了成环问题，但并发下仍然会有数据丢失、size计算错误等问题。生产环境务必使用ConcurrentHashMap。',
        severity: 'high',
      },
      {
        title: '负载因子为什么默认是0.75？',
        description: '这是时间和空间成本的权衡。负载因子太小（如0.5）则频繁扩容浪费空间；太大（如1.0）则哈希冲突严重，查询效率下降。0.75是泊松分布计算后的经验值，此时桶内节点数为8的概率约为千万分之六。',
        severity: 'medium',
      },
      {
        title: '重写equals必须重写hashCode',
        description: '如果只重写equals不重写hashCode，会导致两个equals相等的对象hashCode不同，在HashMap中会被存到不同的桶里，造成"存进去取不出来"的诡异现象。这是面试高频坑点。',
        severity: 'high',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// 正确的 equals 和 hashCode 重写方式
public class User {
    private Long id;
    private String name;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(id, user.id) && 
               Objects.equals(name, user.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }
}`,
      },
    ],
    relatedQuestionIds: ['java-2', 'java-3'],
    isHot: true,
  },
  {
    id: 'java-2',
    title: 'ConcurrentHashMap是如何实现线程安全的？',
    categoryId: 'java',
    difficulty: 'hard',
    content: 'ConcurrentHashMap的实现原理是什么？JDK1.7和1.8的实现有什么不同？为什么它比Hashtable性能更好？',
    standardSolution: `**JDK1.7实现：分段锁（Segment）**
- 内部由Segment数组组成，每个Segment是一个独立的HashMap
- 默认16个Segment，理论上支持16个线程并发写
- put操作：先定位Segment，再对该Segment加锁（ReentrantLock）

**JDK1.8实现：CAS + synchronized**
- 抛弃分段锁，改用Node数组+链表+红黑树
- put操作：
  1. 数组为空时，用CAS初始化数组
  2. 目标桶为空时，用CAS直接插入
  3. 目标桶不为空时，用synchronized锁住桶的头节点
  4. 遍历链表/红黑树，相同key覆盖，不同则追加
  5. 最后检查是否需要扩容或树化

**为什么比Hashtable好？**
- Hashtable是全表加锁（synchronized方法），同一时间只能有一个线程操作
- ConcurrentHashMap锁粒度更细（1.7锁Segment，1.8锁桶头节点），并发度更高`,
    pitfalls: [
      {
        title: 'size()方法的弱一致性',
        description: 'ConcurrentHashMap的size()返回的是一个估计值，不是精确值。因为计算size时没有加锁，中间可能有其他线程修改数据。如果需要精确计数，不要依赖size()，应该用额外的计数器。',
        severity: 'medium',
      },
      {
        title: '不是所有操作都线程安全',
        description: 'ConcurrentHashMap只能保证单个操作（put/get/remove）是原子的。但"先检查后执行"（check-then-act）的组合操作不是线程安全的，比如 if (!map.containsKey(key)) { map.put(key, value); }。这种场景应该使用 putIfAbsent 等原子方法。',
        severity: 'high',
      },
      {
        title: 'key和value不能为null',
        description: 'HashMap允许key和value为null，但ConcurrentHashMap不允许。原因是：在并发环境下，get(key)返回null时，无法区分是"key不存在"还是"value就是null"，这就是所谓的"二义性"问题。',
        severity: 'low',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// 错误：check-then-act 不是原子操作
if (!map.containsKey(key)) {
    map.put(key, value); // 可能被其他线程抢先插入
}

// 正确：使用原子方法
map.putIfAbsent(key, value);

// 正确：使用 computeIfAbsent
map.computeIfAbsent(key, k -> createValue(k));`,
      },
    ],
    relatedQuestionIds: ['java-1', 'java-4'],
    isHot: true,
  },
  {
    id: 'java-3',
    title: 'Synchronized和Lock的区别？',
    categoryId: 'java',
    difficulty: 'medium',
    content: 'synchronized和ReentrantLock有什么区别？各自的使用场景是什么？',
    standardSolution: `**synchronized：**
- JVM层面的关键字，依赖操作系统的Mutex Lock
- 自动加锁和释放锁，无需手动管理
- 非公平锁，不可中断
- 锁升级：无锁 → 偏向锁 → 轻量级锁 → 重量级锁

**ReentrantLock：**
- JDK层面的类，基于AQS实现
- 需要手动lock()和unlock()，通常配合try/finally
- 支持公平锁和非公平锁
- 支持可中断获取锁（lockInterruptibly）
- 支持尝试获取锁（tryLock）
- 支持绑定多个Condition条件

**性能对比：**
- 低竞争时synchronized更优（JVM优化充分）
- 高竞争时ReentrantLock可能更优（但不绝对）`,
    pitfalls: [
      {
        title: 'ReentrantLock忘记释放锁',
        description: 'synchronized会自动释放锁，但ReentrantLock必须手动unlock()。如果不在finally块中释放锁，一旦业务代码抛出异常，锁将永远无法释放，导致死锁。这是新手最容易踩的坑。',
        severity: 'high',
      },
      {
        title: '公平锁性能差很多',
        description: '很多人觉得公平锁"公平"就盲目使用。实际上公平锁因为要维护等待队列，性能比非公平锁差很多（通常差3-5倍）。除非业务确实需要先来先服务，否则默认用非公平锁。',
        severity: 'medium',
      },
      {
        title: 'synchronized不是万能的',
        description: 'synchronized无法响应中断、无法设置超时、无法实现读写锁分离。在复杂的并发场景下（如限时等待、可中断取消、读写锁），还是得用Lock体系。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// ReentrantLock 标准用法
Lock lock = new ReentrantLock();
try {
    lock.lock(); // 加锁
    // 业务逻辑
} finally {
    lock.unlock(); // 必须在finally中释放！
}

// 限时等待
if (lock.tryLock(5, TimeUnit.SECONDS)) {
    try {
        // 业务逻辑
    } finally {
        lock.unlock();
    }
} else {
    // 获取锁超时，做降级处理
}`,
      },
    ],
    relatedQuestionIds: ['java-2', 'java-5'],
    isHot: false,
  },
  {
    id: 'java-4',
    title: 'Java内存模型（JMM）是什么？',
    categoryId: 'java',
    difficulty: 'hard',
    content: '什么是Java内存模型？它解决了什么问题？volatile、synchronized、final这些关键字和JMM有什么关系？',
    standardSolution: `Java内存模型（Java Memory Model）是一种规范，定义了线程和主内存之间的抽象关系，解决了多线程环境下的可见性、有序性和原子性问题。

**三大特性：**
1. **原子性**：一个操作要么全部执行完，要么不执行
2. **可见性**：一个线程修改了共享变量，其他线程能立即看到
3. **有序性**：程序执行的顺序按照代码的先后顺序执行

**内存间交互操作：**
- lock/unlock：作用于主内存变量
- read/load：从主内存读入线程工作内存
- use/assign：在工作内存中使用/赋值
- store/write：从工作内存写回主内存

**volatile的作用：**
1. 保证可见性：写操作后立即刷新回主内存，读操作直接从主内存读
2. 禁止指令重排序：通过内存屏障实现`,
    pitfalls: [
      {
        title: 'volatile不保证原子性',
        description: '这是最常见的误解！很多人以为volatile能保证原子性，实际上volatile只保证可见性和有序性。对于count++这种"读-改-写"复合操作，volatile是无能为力的，必须用synchronized或AtomicInteger。',
        severity: 'high',
      },
      {
        title: '双重检查锁定（DCL）的坑',
        description: '实现单例模式时，双重检查锁定如果不给instance加volatile，可能会因为指令重排序导致"半个对象"的问题。原因：new对象分三步（分配内存、初始化、赋值），可能被重排为（分配内存、赋值、初始化），其他线程拿到的是还没初始化的对象。',
        severity: 'high',
      },
      {
        title: '不是加了synchronized就万事大吉',
        description: 'synchronized确实同时保证三大特性，但前提是锁的是同一个对象。很多人synchronized锁的是不同对象（比如锁this，但创建了多个实例），结果等于没加锁。一定要确认锁对象是共享的。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// 双重检查锁定单例（必须加 volatile！）
public class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {}
    
    public static Singleton getInstance() {
        if (instance == null) {         // 第一次检查
            synchronized (Singleton.class) { // 加锁
                if (instance == null) {     // 第二次检查
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}`,
      },
    ],
    relatedQuestionIds: ['java-2', 'java-3'],
    isHot: true,
  },
  {
    id: 'java-5',
    title: '线程池的核心参数有哪些？',
    categoryId: 'java',
    difficulty: 'medium',
    content: 'ThreadPoolExecutor的核心参数有哪些？任务提交流程是怎样的？常见的线程池有哪些？',
    standardSolution: `**七大核心参数：**
1. corePoolSize：核心线程数
2. maximumPoolSize：最大线程数
3. keepAliveTime：非核心线程空闲存活时间
4. unit：时间单位
5. workQueue：任务队列
6. threadFactory：线程工厂
7. handler：拒绝策略

**任务提交流程：**
1. 线程数 < corePoolSize：创建核心线程执行任务
2. 线程数 >= corePoolSize：任务加入队列
3. 队列满了：创建非核心线程执行（直到maximumPoolSize）
4. 线程数达到maximumPoolSize：执行拒绝策略

**四种拒绝策略：**
- AbortPolicy：直接抛异常（默认）
- CallerRunsPolicy：由提交任务的线程自己执行
- DiscardOldestPolicy：丢弃队列中最老的任务
- DiscardPolicy：直接丢弃，不抛异常`,
    pitfalls: [
      {
        title: 'FixedThreadPool的OOM风险',
        description: 'Executors.newFixedThreadPool()使用的是无界队列（LinkedBlockingQueue默认容量Integer.MAX_VALUE），高并发下任务会不断堆积，最终OOM。生产环境必须手动创建ThreadPoolExecutor，使用有界队列。',
        severity: 'high',
      },
      {
        title: '核心线程也会被回收',
        description: '默认情况下核心线程不会被回收。但如果设置了 allowCoreThreadTimeOut(true)，核心线程也会超时回收。这可能导致频繁创建销毁线程，反而降低性能。',
        severity: 'low',
      },
      {
        title: '线程池的异常被吃了',
        description: '用submit()提交任务，如果任务抛出异常，异常会被Future吞掉，只有调用get()时才会抛出来。很多人用submit又不调用get()，导致异常悄无声息地丢失了，排查问题非常痛苦。用execute()提交则会直接打印异常。',
        severity: 'high',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// 生产环境推荐的线程池创建方式
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10,                          // 核心线程数
    20,                          // 最大线程数
    60L, TimeUnit.SECONDS,       // 空闲存活时间
    new ArrayBlockingQueue<>(100), // 有界队列！
    new ThreadFactoryBuilder()   // 自定义线程工厂
        .setNameFormat("my-pool-%d")
        .build(),
    new ThreadPoolExecutor.CallerRunsPolicy()
);`,
      },
    ],
    relatedQuestionIds: ['java-4', 'java-6'],
    isHot: true,
  },
  // ========== 数据库 题目 ==========
  {
    id: 'db-1',
    title: 'MySQL索引的底层数据结构是什么？',
    categoryId: 'database',
    difficulty: 'medium',
    content: 'MySQL的InnoDB引擎索引底层是用什么数据结构实现的？为什么不用B树、红黑树、哈希表？',
    standardSolution: `InnoDB引擎的索引底层是 **B+树** 实现的。

**B+树的特点：**
1. 非叶子节点只存储索引（键），不存储数据
2. 叶子节点存储完整数据（主键索引存整行，二级索引存主键值）
3. 叶子节点之间用双向链表连接
4. 树的高度一般是2-4层，查询效率稳定

**为什么不用其他数据结构：**
- **哈希表**：只支持等值查询，不支持范围查询和排序
- **二叉搜索树**：可能退化成链表，查询不稳定
- **红黑树**：树太高（数据量大时层数多），磁盘IO次数多
- **B树**：非叶子节点也存数据，每个节点能存的索引更少，树更高

**为什么B+树适合数据库索引：**
1. 磁盘IO少：非叶子节点不存数据，每页能存更多索引，树更矮
2. 范围查询高效：叶子节点是链表，范围查找只需遍历链表
3. 查询效率稳定：任何查询都要走到叶子节点`,
    pitfalls: [
      {
        title: '索引不是越多越好',
        description: '很多人觉得索引能加速查询就建很多索引。实际上：1. 索引占用磁盘空间；2. 增删改操作需要维护所有相关索引，性能下降；3. 索引太多会让优化器选择困难，可能选错索引。一般单表索引不超过5个。',
        severity: 'medium',
      },
      {
        title: '回表查询的性能损耗',
        description: '二级索引查到的是主键值，还需要回表（回主键索引）查完整数据。如果查询结果集很大，回表次数多，性能可能还不如全表扫描。这也是为什么有时候加了索引反而变慢的原因之一。',
        severity: 'high',
      },
      {
        title: '索引字段的选择性',
        description: '选择性低的字段（如性别、状态只有几个枚举值）建索引效果很差，因为区分度太低，扫描索引后还要回表大量数据，优化器可能直接选择全表扫描。一般选择性低于30%的字段不建议单独建索引。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'sql',
        code: `-- 查看索引使用情况
SHOW INDEX FROM table_name;

-- 分析SQL执行计划
EXPLAIN SELECT * FROM table_name WHERE column = 'value';

-- 查看索引选择性
SELECT COUNT(DISTINCT column) / COUNT(*) 
FROM table_name;`,
      },
    ],
    relatedQuestionIds: ['db-2', 'db-3'],
    isHot: true,
  },
  {
    id: 'db-2',
    title: 'MySQL事务的ACID特性是什么？',
    categoryId: 'database',
    difficulty: 'easy',
    content: '什么是事务？ACID四个特性分别是什么？MySQL是如何实现ACID的？',
    standardSolution: `**事务**是一组SQL操作，要么全部成功，要么全部失败。

**ACID四大特性：**

1. **原子性（Atomicity）**：事务是最小执行单元，不可再分。
   - 实现：undo log（回滚日志），记录修改前的数据，异常时回滚

2. **一致性（Consistency）**：事务执行前后，数据都处于合法状态。
   - 实现：由数据库的约束（唯一索引、外键、check约束等）+ 应用层共同保证

3. **隔离性（Isolation）**：多个事务之间互不干扰。
   - 实现：MVCC（多版本并发控制）+ 锁机制

4. **持久性（Durability）**：事务一旦提交，修改就永久生效。
   - 实现：redo log（重做日志），先写日志再写磁盘，崩溃后可恢复`,
    pitfalls: [
      {
        title: 'ACID之间是有矛盾的',
        description: '一致性是最终目标，原子性、隔离性、持久性都是手段。但隔离性和性能是矛盾的——隔离级别越高，并发性能越差。实际项目中需要根据业务场景权衡，不是隔离级别越高越好。',
        severity: 'medium',
      },
      {
        title: '不是所有存储引擎都支持事务',
        description: 'MySQL的MyISAM引擎不支持事务，只有InnoDB支持。有些老系统还在用MyISAM，或者建表时不小心用了MyISAM，结果事务怎么都不生效。建表时一定要确认 ENGINE=InnoDB。',
        severity: 'high',
      },
    ],
    codeExamples: [
      {
        language: 'sql',
        code: `-- 查看当前存储引擎
SHOW ENGINES;

-- 查看表的存储引擎
SHOW CREATE TABLE table_name;

-- 修改表的存储引擎
ALTER TABLE table_name ENGINE=InnoDB;`,
      },
    ],
    relatedQuestionIds: ['db-1', 'db-4'],
    isHot: false,
  },
  {
    id: 'db-3',
    title: 'MySQL的事务隔离级别有哪些？',
    categoryId: 'database',
    difficulty: 'medium',
    content: 'MySQL有哪几种事务隔离级别？分别解决了什么问题？默认隔离级别是什么？',
    standardSolution: `**四种隔离级别（从低到高）：**

1. **读未提交（READ UNCOMMITTED）**
   - 问题：脏读（读到其他事务未提交的数据）

2. **读已提交（READ COMMITTED）**
   - 解决：脏读
   - 问题：不可重复读（同一个事务内，两次读同一数据结果不一样）

3. **可重复读（REPEATABLE READ）**
   - 解决：脏读、不可重复读
   - 问题：幻读（同一个事务内，两次查出来的行数不一样）
   - MySQL默认级别，通过MVCC+间隙锁解决了大部分幻读

4. **串行化（SERIALIZABLE）**
   - 解决：脏读、不可重复读、幻读
   - 问题：性能最差，所有select都会加共享锁

**MySQL默认隔离级别：REPEATABLE READ（可重复读）**

**实现方式：**
- RC级别：每次select都生成新的ReadView
- RR级别：事务开始时生成ReadView，之后一直用这个`,
    pitfalls: [
      {
        title: 'RR级别也会有幻读',
        description: '很多人以为MySQL的RR级别完全解决了幻读，其实没有。快照读（普通select）通过MVCC解决了幻读，但当前读（select ... for update/insert/update/delete）还是可能出现幻读。InnoDB是用间隙锁（Gap Lock）来解决当前读的幻读问题。',
        severity: 'high',
      },
      {
        title: '不要随便改隔离级别',
        description: '有些人为了提升性能把隔离级别改成RC。但RC级别下可能导致主从不一致（statement格式的binlog），还可能出现不可重复读影响业务逻辑。改之前一定要评估业务影响，而且最好配合row格式的binlog。',
        severity: 'high',
      },
      {
        title: '长事务的危害',
        description: '事务持有时间过长会导致：1. undo log堆积无法清理（因为要保留长事务需要的版本）；2. 锁占用时间长，影响并发；3. 可能导致主从延迟。生产环境要避免长事务，尽量把事务控制在毫秒级。',
        severity: 'high',
      },
    ],
    codeExamples: [
      {
        language: 'sql',
        code: `-- 查看当前隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 查看当前有哪些事务
SELECT * FROM information_schema.INNODB_TRX;

-- 查看锁等待
SELECT * FROM information_schema.INNODB_LOCK_WAITS;`,
      },
    ],
    relatedQuestionIds: ['db-2', 'db-5'],
    isHot: true,
  },
  {
    id: 'db-4',
    title: '什么是死锁？如何避免？',
    categoryId: 'database',
    difficulty: 'medium',
    content: '数据库中什么是死锁？死锁产生的条件是什么？如何排查和避免死锁？',
    standardSolution: `**死锁**：两个或多个事务互相等待对方释放资源，导致永久阻塞。

**死锁的四个必要条件：**
1. 互斥条件：资源不能共享，同一时间只能一个事务持有
2. 请求与保持：持有资源的同时请求新资源
3. 不可剥夺：已获得的资源不能被强行剥夺
4. 循环等待：事务之间形成环状等待链

**排查方法：**
1. SHOW ENGINE INNODB STATUS 查看最近的死锁日志
2. 打开 innodb_print_all_deadlocks 记录所有死锁
3. performance_schema.data_locks 查看当前锁

**避免策略：**
1. 统一加锁顺序（所有事务按相同顺序访问资源）
2. 减少锁持有时间（事务尽量短小）
3. 降低隔离级别（如用RC）
4. 使用更合理的索引，减少锁范围
5. 用乐观锁代替悲观锁`,
    pitfalls: [
      {
        title: '索引不好导致大范围加锁',
        description: '很多死锁不是业务逻辑问题，而是索引没建好。比如update时走了全表扫描，会给整张表的记录加行锁（甚至间隙锁），大大增加死锁概率。执行update/delete前一定用explain看看走没走索引。',
        severity: 'high',
      },
      {
        title: '死锁不是程序Bug',
        description: '新手遇到死锁就很恐慌，觉得是大Bug。其实在高并发系统中，死锁是正常现象，关键是概率要低。MySQL会自动检测死锁并回滚代价最小的事务。应用层需要捕获异常并重试，这才是正确的处理方式。',
        severity: 'medium',
      },
      {
        title: 'gap lock加重死锁概率',
        description: 'RR隔离级别下有间隙锁，范围查询时会锁住一个区间，容易导致不同事务在同一个间隙内互相等待。如果业务允许，把隔离级别降到RC可以消除间隙锁，降低死锁概率。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'sql',
        code: `-- 查看最近一次死锁
SHOW ENGINE INNODB STATUS;

-- 开启死锁日志
SET GLOBAL innodb_print_all_deadlocks = ON;

-- 查看当前持有的锁
SELECT * FROM performance_schema.data_locks;

-- 乐观锁实现
UPDATE table SET status = 1, version = version + 1 
WHERE id = 123 AND version = 0;`,
      },
    ],
    relatedQuestionIds: ['db-3', 'db-5'],
    isHot: false,
  },
  {
    id: 'db-5',
    title: 'MVCC的实现原理是什么？',
    categoryId: 'database',
    difficulty: 'hard',
    content: '什么是MVCC？它是如何实现的？ReadView是什么？',
    standardSolution: `MVCC（Multi-Version Concurrency Control，多版本并发控制）是InnoDB实现隔离级别的一种方式，用于读写冲突不加锁，提高并发性能。

**实现要素：**

1. **隐式字段**
   - DB_TRX_ID：最近一次修改该行的事务ID
   - DB_ROLL_PTR：指向undo log中该行的上一个版本
   - DB_ROW_ID：隐藏主键（没有主键时自动生成）

2. **undo log（回滚日志）**
   - 保存数据的历史版本，形成版本链

3. **ReadView（读视图）**
   - 事务启动时生成，判断哪些版本对当前事务可见
   - 包含：
     - m_ids：当前活跃的事务ID列表
     - min_trx_id：最小活跃事务ID
     - max_trx_id：下一个要分配的事务ID
     - creator_trx_id：创建ReadView的事务ID

**可见性判断规则：**
1. 版本的trx_id < min_trx_id → 可见（已提交）
2. 版本的trx_id >= max_trx_id → 不可见（还没开始）
3. 版本的trx_id在m_ids中 → 不可见（活跃未提交）
4. 版本的trx_id不在m_ids中 → 可见（已提交）`,
    pitfalls: [
      {
        title: '快照读和当前读的区别',
        description: 'MVCC只对"快照读"（普通select）有效。"当前读"（select ... for update、insert、update、delete）走的是锁机制，不是MVCC。很多人以为所有读都走MVCC，这是常见误区。',
        severity: 'high',
      },
      {
        title: 'RC和RR的ReadView生成时机不同',
        description: 'RC级别：每次select都会生成新的ReadView，所以能读到其他事务刚提交的数据（不可重复读）。RR级别：只在第一次select时生成ReadView，之后一直复用，所以能重复读。这是两者最核心的区别。',
        severity: 'medium',
      },
      {
        title: 'undo log不是无限增长的',
        description: '有人担心版本链会越来越长。实际上，purge线程会定期清理不再需要的undo log。但如果有长事务一直持有老版本的ReadView，对应的undo log就无法清理，导致undo表空间膨胀。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'sql',
        code: `-- 快照读（走MVCC，不加锁）
SELECT * FROM table WHERE id = 1;

-- 当前读（加锁）
SELECT * FROM table WHERE id = 1 FOR UPDATE;
SELECT * FROM table WHERE id = 1 LOCK IN SHARE MODE;`,
      },
    ],
    relatedQuestionIds: ['db-3', 'db-1'],
    isHot: true,
  },
  // ========== 缓存 题目 ==========
  {
    id: 'cache-1',
    title: '缓存穿透、击穿、雪崩分别是什么？',
    categoryId: 'cache',
    difficulty: 'medium',
    content: '请解释缓存穿透、缓存击穿、缓存雪崩的区别，以及各自的解决方案。',
    standardSolution: `**缓存穿透：**
- 现象：查询一个不存在的数据，缓存和数据库都没有，每次请求都打到数据库
- 原因：恶意攻击、参数错误
- 解决方案：
  1. 缓存空值（设置较短过期时间）
  2. 布隆过滤器（Bloom Filter）
  3. 参数校验（拦截非法请求）

**缓存击穿：**
- 现象：某一个热点key过期，瞬间大量请求打到数据库
- 原因：热点key失效
- 解决方案：
  1. 热点数据永不过期
  2. 互斥锁（只让一个线程去查库，其他等待）
  3. 后台异步更新

**缓存雪崩：**
- 现象：大量key同时失效，或者缓存服务宕机，数据库压力骤增
- 原因：集中过期、缓存集群挂掉
- 解决方案：
  1. 过期时间加随机值（避免集中过期）
  2. 缓存集群高可用（哨兵/集群模式）
  3. 服务降级/熔断
  4. 多级缓存（本地缓存+Redis）`,
    pitfalls: [
      {
        title: '布隆过滤器有误判率',
        description: '布隆过滤器说"存在"的元素可能不存在（误判），但说"不存在"的元素一定不存在。所以用布隆过滤器防穿透时，会有少量合法请求被误拦。如果业务对准确性要求很高，要权衡误判率的影响。',
        severity: 'medium',
      },
      {
        title: '互斥锁注意死锁和超时',
        description: '用分布式锁解决缓存击穿时，要注意：1. 锁一定要有过期时间，防止查库失败导致死锁；2. 不要用同一个锁key，不然多个不同的key互相阻塞；3. 不要让所有线程都阻塞等锁，可以考虑快速失败或降级。',
        severity: 'high',
      },
      {
        title: '缓存空值要防内存膨胀',
        description: '如果恶意攻击者用大量不同的不存在的key来请求，缓存空值方案会导致缓存大量无用的空值，浪费内存。可以给空值设置很短的过期时间（如30秒），或者用布隆过滤器前置拦截。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// 互斥锁解决缓存击穿
public String getValue(String key) {
    String value = redis.get(key);
    if (value != null) return value;
    
    String lockKey = "lock:" + key;
    try {
        if (redis.set(lockKey, "1", "EX", 30, "NX")) {
            value = db.query(key);
            if (value != null) {
                redis.set(key, value, 3600);
            } else {
                redis.set(key, "", 60); // 缓存空值
            }
            return value;
        } else {
            Thread.sleep(100);
            return getValue(key); // 重试
        }
    } finally {
        redis.del(lockKey);
    }
}`,
      },
    ],
    relatedQuestionIds: ['cache-2', 'cache-3'],
    isHot: true,
  },
  {
    id: 'cache-2',
    title: 'Redis和数据库的数据一致性如何保证？',
    categoryId: 'cache',
    difficulty: 'hard',
    content: '先更新数据库还是先删缓存？为什么？有哪些保证最终一致性的方案？',
    standardSolution: `**常见策略对比：**

1. **先更新数据库，再删除缓存**
   - 推荐方案（Cache Aside Pattern）
   - 异常情况：更新数据库成功，删除缓存失败 → 数据不一致
   - 解决：重试机制、订阅binlog异步删除

2. **先删缓存，再更新数据库**
   - 不推荐
   - 异常情况：删缓存后，另一个线程读，把旧值写回缓存 → 数据不一致
   - 解决：延时双删（更新数据库后，延迟一段时间再删一次）

3. **读写分离场景的问题**
   - 主库更新，从库还没同步，读从库后写缓存 → 读到旧数据
   - 解决：延迟双删的时间要大于主从同步时间

**最终一致性方案：**
1. **消息队列异步重试**：删除失败的话，发消息到MQ，消费者重试
2. **订阅binlog**：用canal监听数据库变更，异步更新缓存
3. **设置过期时间**：兜底方案，即使不一致，过期后也会恢复`,
    pitfalls: [
      {
        title: '延迟双删不是万能的',
        description: '很多人听说过延迟双删就觉得很厉害，但实际上：1. 延迟时间很难准确估计；2. 高并发下还是有概率不一致；3. 第二次删除失败怎么办？延迟双删更多是一种"减少不一致概率"的手段，不是银弹。',
        severity: 'medium',
      },
      {
        title: '为什么是删缓存不是更新缓存',
        description: '很多人会问：为什么不直接更新缓存，而是删除？因为：1. 更新缓存可能是无效写（写了之后很久没人读）；2. 并发写的情况下，更新顺序可能乱掉。删除缓存更简单，下次读的时候再加载。',
        severity: 'high',
      },
      {
        title: '不是所有数据都适合缓存',
        description: '追求强一致性的场景（如账户余额、库存扣减）不要用缓存，或者只做读缓存且接受短暂不一致。如果对一致性要求极高，直接读数据库。',
        severity: 'high',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// Cache Aside 模式：读
public User getUser(Long id) {
    User user = redis.get("user:" + id);
    if (user != null) return user;
    user = db.selectById(id);
    if (user != null) {
        redis.set("user:" + id, user, 3600);
    }
    return user;
}

// Cache Aside 模式：写
public void updateUser(User user) {
    db.updateById(user);         // 1. 先更新数据库
    redis.del("user:" + user.getId()); // 2. 再删除缓存
}`,
      },
    ],
    relatedQuestionIds: ['cache-1', 'cache-4'],
    isHot: true,
  },
  {
    id: 'cache-3',
    title: 'Redis有哪些数据结构？分别适用于什么场景？',
    categoryId: 'cache',
    difficulty: 'easy',
    content: 'Redis有哪几种常用数据结构？每种数据结构的底层实现和适用场景是什么？',
    standardSolution: `**5种基础数据结构：**

1. **String（字符串）**
   - 底层：int + embstr + raw
   - 场景：缓存对象、计数器、分布式锁
   - 最大512MB

2. **Hash（哈希）**
   - 底层：ziplist + hashtable
   - 场景：对象缓存（用户信息、商品信息）
   - 适合存储结构化数据

3. **List（列表）**
   - 底层：ziplist + linkedlist（3.2后是quicklist）
   - 场景：消息队列、排行榜、时间线
   - 两端操作快，中间操作慢

4. **Set（集合）**
   - 底层：intset + hashtable
   - 场景：去重、交集并集差集、共同好友
   - 元素唯一，无序

5. **ZSet（有序集合）**
   - 底层：ziplist + skiplist
   - 场景：排行榜、带权重的队列、范围查找
   - 元素唯一，按score排序

**3种高级数据结构：**
- HyperLogLog：基数统计（UV统计），有误差
- Geo：地理位置（附近的人）
- Bitmap：位图（用户签到、布隆过滤器）`,
    pitfalls: [
      {
        title: '大Key问题',
        description: '单个key对应的value过大（如几MB甚至几十MB）会导致：1. 网络传输慢；2. 阻塞Redis（单线程）；3. 内存不均，集群迁移困难。String控制在10KB以内，Hash/List/Set/ZSet元素数量控制在1万以内。',
        severity: 'high',
      },
      {
        title: '不是什么都能用String存',
        description: '很多人图省事，把所有数据都序列化成JSON存String。这样每次更新都要整体读写，部分更新非常低效。如果数据有多个字段且经常部分更新，应该用Hash。',
        severity: 'medium',
      },
      {
        title: 'HyperLogLog的误差',
        description: 'HyperLogLog号称能存海量数据且只占12KB，但它是有误差的（标准误差约0.81%）。只能用于统计大概数量，不能用于精确统计。',
        severity: 'low',
      },
    ],
    codeExamples: [
      {
        language: 'redis',
        code: `# String - 计数器
INCR page_view:1001
DECR stock:product_123

# Hash - 用户信息
HSET user:1 name "张三" age 25
HGET user:1 name

# ZSet - 排行榜
ZADD leaderboard 1000 "user1" 900 "user2"
ZREVRANGE leaderboard 0 9 WITHSCORES

# Set - 共同好友
SINTER friends:user1 friends:user2`,
      },
    ],
    relatedQuestionIds: ['cache-1', 'cache-5'],
    isHot: false,
  },
  {
    id: 'cache-4',
    title: 'Redis的持久化机制有哪些？',
    categoryId: 'cache',
    difficulty: 'medium',
    content: 'RDB和AOF是什么？它们的区别是什么？各自的优缺点？生产环境怎么选？',
    standardSolution: `**RDB（快照方式）：**
- 在某个时间点，把内存中的数据完整保存到磁盘
- 触发方式：save（阻塞）、bgsave（后台子进程）、自动配置
- 优点：文件紧凑、恢复速度快、对性能影响小
- 缺点：可能丢失最近一次快照后的数据

**AOF（追加方式）：**
- 把每个写命令都追加到日志文件末尾
- 三种写回策略：always、everysec（默认）、no
- 优点：数据安全性高（最多丢1秒）、可读性好
- 缺点：文件体积大、恢复速度慢
- 重写机制（AOF Rewrite）：定期压缩AOF文件

**RDB-AOF混合持久化（4.0后推荐）：**
- AOF重写时，先写RDB格式，再追加写命令
- 兼顾恢复速度和数据安全性

**生产环境建议：**
- 能容忍几分钟数据丢失：只用RDB（性能最好）
- 不能丢数据：RDB+AOF混合模式
- 纯缓存场景：都可以关（数据从数据库加载）`,
    pitfalls: [
      {
        title: 'bgsave不是完全不影响',
        description: '很多人以为bgsave是子进程执行，对主进程完全没影响。实际上fork子进程的时候，主进程是阻塞的（时间和内存大小正相关）。而且写时复制（COW）机制下，如果写操作多，内存占用会翻倍。',
        severity: 'high',
      },
      {
        title: 'AOF重写也会fork',
        description: 'AOF重写也会fork子进程，和bgsave一样有fork阻塞问题。如果RDB和AOF重写同时触发，会更卡。可以设置 no-appendfsync-on-rewrite=yes，重写时暂停刷盘。',
        severity: 'medium',
      },
      {
        title: '备份不等于持久化',
        description: '持久化是防止Redis挂了之后数据丢失。但如果磁盘坏了、机器宕机了，持久化也没用。高可用靠的是主从复制+哨兵/集群，不要以为开了持久化就高枕无忧了。',
        severity: 'high',
      },
    ],
    codeExamples: [
      {
        language: 'properties',
        code: `# redis.conf 配置示例

# RDB配置
save 900 1
save 300 10
save 60 10000

# AOF配置
appendonly yes
appendfsync everysec

# 混合持久化
aof-use-rdb-preamble yes

# 重写时暂停刷盘
no-appendfsync-on-rewrite yes`,
      },
    ],
    relatedQuestionIds: ['cache-2', 'cache-5'],
    isHot: false,
  },
  {
    id: 'cache-5',
    title: 'Redis为什么这么快？',
    categoryId: 'cache',
    difficulty: 'easy',
    content: 'Redis为什么性能这么高？它是单线程的吗？为什么单线程还能这么快？',
    standardSolution: `Redis快的原因：

1. **纯内存操作**
   - 所有数据都在内存中，读写都是内存级别的速度（纳秒级）
   - 这是最核心的原因

2. **单线程模型**
   - 避免了多线程的上下文切换和锁竞争
   - 注意：单线程指的是命令执行是单线程

3. **IO多路复用**
   - 使用epoll/kqueue等IO多路复用技术
   - 单线程可以同时处理大量并发连接
   - 非阻塞IO

4. **高效的数据结构**
   - 底层是优化过的数据结构（跳表、压缩列表等）
   - 操作的时间复杂度低

5. **简洁的协议**
   - RESP协议简单易解析
   - 传输效率高

**Redis 6.0之后引入了多线程：**
- 网络IO处理用多线程（读写网络数据）
- 命令执行仍然是单线程
- 进一步提升了多核CPU下的吞吐量`,
    pitfalls: [
      {
        title: '单线程不代表一定安全',
        description: 'Redis是单线程的，单个命令是原子的。但多个命令组合不是原子的（如"先get后set"），并发下还是会有竞态条件。需要原子操作的场景，要用Lua脚本或事务。',
        severity: 'high',
      },
      {
        title: '慢命令会拖垮整个Redis',
        description: '因为是单线程，某个慢命令（如keys *、hgetall大hash）会阻塞所有其他命令。生产环境一定要禁用keys *，避免大Key操作，设置慢查询日志监控。',
        severity: 'high',
      },
      {
        title: '不是存什么都快',
        description: 'Redis快是因为数据在内存，但如果value特别大（几MB甚至几十MB），网络传输时间会远超命令执行时间，瓶颈就不在Redis而在网络了。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'redis',
        code: `# 慢查询配置
CONFIG SET slowlog-log-slower-than 10000
CONFIG SET slowlog-max-len 128

# 查看慢查询
SLOWLOG GET 10

# 禁止危险命令（redis.conf中配置）
# rename-command KEYS ""
# rename-command FLUSHDB ""`,
      },
    ],
    relatedQuestionIds: ['cache-3', 'cache-1'],
    isHot: true,
  },
  // ========== 消息队列 题目 ==========
  {
    id: 'mq-1',
    title: '消息队列有什么用？',
    categoryId: 'mq',
    difficulty: 'easy',
    content: '为什么要用消息队列？它解决了什么问题？有什么缺点？',
    standardSolution: `**消息队列的三大核心作用：**

1. **异步（Async）**
   - 把不需要同步执行的操作放到消息队列里异步处理
   - 例子：注册成功后发短信、发邮件
   - 好处：降低接口响应时间，提升用户体验

2. **解耦（Decouple）**
   - 系统之间通过消息队列通信，不直接调用
   - 例子：订单系统下单后，库存系统、物流系统各自消费
   - 好处：系统解耦，易于扩展

3. **削峰（Peak Shaving）**
   - 瞬时高并发请求先写入消息队列
   - 消费者按自己的节奏慢慢消费
   - 例子：秒杀活动、大促下单
   - 好处：保护下游系统不被冲垮

**使用MQ的缺点：**
1. 系统复杂度增加（消息丢失、重复消费、顺序性等问题）
2. 系统可用性降低（多了一个依赖）
3. 一致性问题（消息消费失败怎么办）`,
    pitfalls: [
      {
        title: '不是所有场景都适合异步',
        description: '很多人为了"优化性能"到处用MQ，结果搞得系统很复杂。如果业务本身就是同步的（如支付结果必须立即返回），或者流量不大，就没必要用MQ。',
        severity: 'medium',
      },
      {
        title: '消息堆积不是坏事',
        description: '很多人一看到消息堆积就慌。实际上削峰场景下，消息堆积是正常的——就是要让消息先堆着，消费者慢慢消费。关键是堆积量在可接受范围内。',
        severity: 'low',
      },
      {
        title: '引入MQ后问题会更多',
        description: 'MQ不是银弹，引入后会带来一系列新问题：消息丢失、重复消费、消息顺序、消息积压、死信……这些问题的复杂度可能比你用MQ解决的问题还大。',
        severity: 'high',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// 同步调用 - 用户等很久
public void register(User user) {
    userDao.insert(user);          // 10ms
    emailService.sendWelcome();    // 100ms
    smsService.sendVerifyCode();   // 50ms
    // 总共约160ms
}

// 异步化 - 用户很快收到响应
public void register(User user) {
    userDao.insert(user);          // 10ms
    mq.send("register", user);     // 1ms
    // 总共约11ms
}`,
      },
    ],
    relatedQuestionIds: ['mq-2', 'mq-3'],
    isHot: true,
  },
  {
    id: 'mq-2',
    title: '如何保证消息不丢失？',
    categoryId: 'mq',
    difficulty: 'medium',
    content: '消息从生产到消费的过程中，哪些环节可能丢失？如何保证消息的可靠性？',
    standardSolution: `**消息可能丢失的三个环节：**

1. **生产阶段**（生产者 → Broker）
   - 网络抖动导致消息没发出去
   - Broker挂了，没收到消息

2. **存储阶段**（Broker内部）
   - Broker收到消息还没刷盘就挂了
   - Broker节点故障，副本还没同步

3. **消费阶段**（Broker → 消费者）
   - 消费者收到消息还没处理就挂了
   - 消费失败但已经提交了offset

**解决方案：**

**生产端：**
- 发送确认机制（ack=all / confirm模式）
- 失败重试机制
- 消息落库，定时重发

**Broker端：**
- 持久化配置（持久化topic + 刷盘策略）
- 多副本（集群模式，至少2副本）
- 同步刷盘（牺牲性能换可靠）

**消费端：**
- 手动提交offset（处理完再提交）
- 消费失败重试
- 死信队列（重试多次失败后进入死信）`,
    pitfalls: [
      {
        title: 'ack=all也不是100%可靠',
        description: 'acks=all只保证ISR中的副本都收到了。如果所有副本都挂了，消息还是会丢。想要真正高可靠，需要：多副本（至少3副本） + min.insync.replicas >= 2 + acks=all。',
        severity: 'high',
      },
      {
        title: '同步刷盘性能很差',
        description: '同步刷盘能保证消息不丢，但性能下降很多（从几万TPS降到几千）。大部分业务场景用异步刷盘就够了，除非是金融级别的核心链路。',
        severity: 'medium',
      },
      {
        title: '消费端幂等性更重要',
        description: '追求"消息不丢"的同时，必然会引入重复消息。所以保证幂等性比追求不丢消息更实用——只要消费是幂等的，重复几次也无所谓。"至少一次投递 + 幂等消费"是业界主流方案。',
        severity: 'high',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// Kafka 高可靠生产配置
Properties props = new Properties();
props.put("acks", "all");
props.put("retries", 3);
props.put("enable.idempotence", true);

// 消费端手动提交
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(100);
    for (ConsumerRecord<String, String> record : records) {
        process(record);
    }
    consumer.commitSync(); // 处理完再提交
}`,
      },
    ],
    relatedQuestionIds: ['mq-1', 'mq-4'],
    isHot: true,
  },
  {
    id: 'mq-3',
    title: '如何保证消息的顺序性？',
    categoryId: 'mq',
    difficulty: 'hard',
    content: '消息队列能保证消息严格有序吗？如何实现局部有序？有哪些坑？',
    standardSolution: `**全局有序 vs 局部有序：**
- 全局有序：所有消息严格按发送顺序消费 → 只有一个队列，一个消费者
- 局部有序：某一组消息有序（如同一个订单的状态变更） → 分队列，同组消息进同一队列

**Kafka实现顺序性：**

**生产端：**
- 相同key的消息会发到同一个partition
- 用业务ID（如orderId）作为key

**Broker端：**
- 每个partition内部是有序的

**消费端：**
- 每个partition只能被一个消费者实例消费
- 消费者内部不要多线程处理

**RocketMQ实现顺序性：**
- 用MessageQueueSelector选择队列
- 同组消息发到同一个MessageQueue
- 消费端用MessageListenerOrderly`,
    pitfalls: [
      {
        title: '顺序性和性能是矛盾的',
        description: '要顺序就要串行，要并行就没法保证顺序。很多人一上来就要求"消息严格有序"，结果吞吐量极低。实际上大部分场景只需要局部有序。',
        severity: 'high',
      },
      {
        title: '开启重试可能导致乱序',
        description: 'Kafka中，如果max.in.flight.requests.per.connection > 1且开启了重试，可能出现：消息1发送失败重试，消息2发送成功，结果消息2在消息1前面。要保证顺序，要么设为1，要么开启幂等生产者。',
        severity: 'high',
      },
      {
        title: '消费失败重试会破坏顺序',
        description: '假设消息1处理失败进入重试队列，消息2处理成功继续消费，那消息2就在消息1前面被消费了。这是个两难的问题，需要业务权衡。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// Kafka - 按key分区保证局部有序
ProducerRecord<String, String> record = 
    new ProducerRecord<>("order_topic", orderId, message);
// 相同orderId的消息会进同一个partition

// 消费端 - 单线程处理每个partition
ConsumerRecords<String, String> records = consumer.poll(100);
for (TopicPartition partition : records.partitions()) {
    List<ConsumerRecord<String, String>> partRecords = 
        records.records(partition);
    for (ConsumerRecord<String, String> record : partRecords) {
        process(record); // 不要用多线程！
    }
}`,
      },
    ],
    relatedQuestionIds: ['mq-2', 'mq-5'],
    isHot: false,
  },
  {
    id: 'mq-4',
    title: '消息积压了怎么办？',
    categoryId: 'mq',
    difficulty: 'medium',
    content: '线上消息积压严重，如何快速排查和处理？有哪些预防措施？',
    standardSolution: `**排查步骤：**

1. **定位问题**
   - 查看监控：哪个topic？哪个消费组？积压了多少？
   - 看消费者：是消费不过来，还是消费卡住了？
   - 看日志：有没有报错？是不是卡在某个消息上？

2. **紧急处理**

**情况A：消费者正常但消费速度慢**
- 临时扩容消费者数量（但不能超过partition数）
- 优化消费逻辑（如批量处理、减少IO）

**情况B：消费卡住了（死循环、外部依赖超时）**
- 先修复消费逻辑
- 如果坏消息阻塞了，可以先跳过坏消息（移到死信）

**情况C：流量洪峰（预期内）**
- 不用慌，让消息慢慢消费
- 可以临时加消费者加速

**预防措施：**
1. 监控告警：设置积压量阈值告警
2. 合理设置消费并发
3. 消费逻辑做超时控制
4. 死信队列兜底
5. 流量预估和压测`,
    pitfalls: [
      {
        title: '盲目扩容没用',
        description: 'Kafka中，一个partition只能被一个消费者线程消费。如果partition只有10个，你开100个消费者也没用。遇到积压先看partition数和消费者数的比例。',
        severity: 'high',
      },
      {
        title: '新建topic临时扩容的坑',
        description: '紧急情况下有人会新建一个更多partition的topic，然后把旧消息导过去。但是消息顺序会被打乱！如果业务依赖顺序性，这样做会出大问题。',
        severity: 'high',
      },
      {
        title: '消息丢了可不是小事',
        description: '处理积压时，有些人图省事直接把消息删了或者跳过。消息里可能是订单、支付、积分等重要业务数据，丢了消息可能要赔钱的。',
        severity: 'high',
      },
    ],
    codeExamples: [
      {
        language: 'bash',
        code: `# 查看消费堆积情况
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \\
  --describe --group my-consumer-group

# 查看topic消息总数
kafka-run-class.sh kafka.tools.GetOffsetShell \\
  --broker-list localhost:9092 --topic my_topic`,
      },
    ],
    relatedQuestionIds: ['mq-2', 'mq-5'],
    isHot: false,
  },
  {
    id: 'mq-5',
    title: 'Kafka和RabbitMQ有什么区别？',
    categoryId: 'mq',
    difficulty: 'medium',
    content: 'Kafka和RabbitMQ的核心区别是什么？各自的适用场景是什么？选型时怎么考虑？',
    standardSolution: `**核心区别对比：**

| 特性 | Kafka | RabbitMQ |
|------|-------|----------|
| 模型 | 发布/订阅，基于日志 | AMQP协议，基于队列 |
| 性能 | 极高（百万级TPS） | 较高（万级TPS） |
| 消息顺序 | partition内有序 | 队列内有序 |
| 消息保留 | 按时间/大小保留，可回溯 | 消费完就删（默认） |
| 路由能力 | 简单（按topic+partition） | 强大（exchange多种路由） |

**选型建议：**

**选Kafka：**
- 大数据场景（日志收集、流处理）
- 超高吞吐量要求
- 需要消息回溯
- 事件溯源、数据管道

**选RabbitMQ：**
- 业务系统集成（解耦、异步）
- 需要灵活的路由规则
- 需要延迟消息、死信队列等
- 对可靠性要求高、吞吐要求中等`,
    pitfalls: [
      {
        title: 'Kafka不是传统消息队列',
        description: 'Kafka本质上是一个分布式的"可重复读的日志系统"，不是传统意义上的消息队列。它的消息是追加写入的，消费完不会删除。用Kafka要转变思路。',
        severity: 'medium',
      },
      {
        title: 'Kafka的"慢"不是你想的那样',
        description: 'Kafka吞吐高，但单条消息的延迟不一定低。因为它是批量处理、攒一批再发，低延迟不是它的强项。如果要求毫秒级延迟，RabbitMQ可能更合适。',
        severity: 'medium',
      },
      {
        title: '不要迷信性能数据',
        description: '各种评测说Kafka百万TPS、RabbitMQ几万TPS，感觉差了100倍。实际业务中，消费逻辑才是瓶颈。大部分业务场景两者性能都够用。',
        severity: 'low',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// Kafka - 发布订阅模式
// 一个topic可以被多个消费组订阅

// RabbitMQ - 四种Exchange
// 1. Direct：精确匹配路由键
// 2. Topic：通配符匹配
// 3. Fanout：广播
// 4. Headers：根据消息头匹配`,
      },
    ],
    relatedQuestionIds: ['mq-1', 'mq-2'],
    isHot: true,
  },
  // ========== 系统设计 题目 ==========
  {
    id: 'sd-1',
    title: '如何设计一个秒杀系统？',
    categoryId: 'system-design',
    difficulty: 'hard',
    content: '设计一个高并发秒杀系统，需要考虑哪些点？整体架构是怎样的？',
    standardSolution: `**秒杀系统的核心挑战：**
1. 高并发：瞬间大量请求涌入
2. 库存少：僧多粥少，大部分人抢不到
3. 防作弊：防止黄牛、脚本抢购

**整体架构思路（分层拦截）：**

**1. 前端层**
- 页面静态化（CDN缓存）
- 按钮置灰，防止重复点击
- 验证码/答题（延缓请求，防脚本）
- 前端限流（限制点击频率）

**2. 接入层（Nginx/网关）**
- 限流（令牌桶、漏桶）
- 黑白名单（防攻击）
- 按用户维度限流
- 动静分离

**3. 业务层（应用服务）**
- 库存预热：活动开始前把库存加载到Redis
- 扣减库存：Redis原子操作（DECR）
- 请求削峰：用消息队列异步处理
- 快速失败：库存没了直接返回
- 本地缓存：布隆过滤器、库存标记

**4. 数据层**
- 数据库最终一致性（下单后扣减数据库库存）
- 乐观锁防止超卖
- 分库分表（订单量大的话）`,
    pitfalls: [
      {
        title: '不要用数据库扛并发',
        description: '新手设计秒杀系统，一上来就"查库存→扣库存→下单"全走数据库。数据库的并发能力是有限的（几千TPS顶天了），秒杀的并发是几十万级的。必须用Redis扛流量。',
        severity: 'high',
      },
      {
        title: '超卖是最严重的事故',
        description: '秒杀最容易出的事故就是超卖（库存100，卖出了200件）。一定要加多重防护：Redis原子扣减 + 数据库乐观锁 + 唯一索引兜底。',
        severity: 'high',
      },
      {
        title: '别忽略了风控',
        description: '只考虑技术性能，不考虑业务风控，秒杀活动就变成了黄牛党的狂欢。需要实名认证/登录限制、验证码/人机验证、设备指纹/IP限制、风控规则。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// Redis 原子扣减库存（Lua脚本）
String script = 
    "if redis.call('exists', KEYS[1]) == 0 then return -1 " +
    "elseif tonumber(redis.call('get', KEYS[1])) <= 0 then return 0 " +
    "else return redis.call('decr', KEYS[1]) end";

Long result = jedis.eval(script, 1, "stock:" + seckillId);
// result > 0：抢到了；result == 0：没库存；result == -1：活动不存在`,
      },
    ],
    relatedQuestionIds: ['sd-2', 'sd-3'],
    isHot: true,
  },
  {
    id: 'sd-2',
    title: '如何设计一个短链接系统？',
    categoryId: 'system-design',
    difficulty: 'medium',
    content: '设计一个短链接系统，支持长链接转短链接，以及短链接跳转。需要考虑哪些技术点？',
    standardSolution: `**核心功能：**
1. 长链接 → 短链接（生成）
2. 短链接 → 长链接（重定向跳转）
3. 访问统计（可选）

**短码生成方案：**

**方案一：自增ID + 62进制转换**
- 数据库自增ID，转成62进制字符串（0-9, a-z, A-Z）
- 优点：简单，不会冲突，有序增长
- 缺点：短码是递增的，容易被猜中，安全性差

**方案二：哈希算法**
- 对长URL做哈希（如MD5取前几位）
- 优点：无规律，相对安全
- 缺点：可能冲突，需要处理碰撞

**方案三：随机字符串**
- 随机生成短码，检查是否已存在
- 优点：灵活，安全性高
- 缺点：生成时需要查重，有性能损耗

**系统设计要点：**
1. 短码长度：6位（62^6 ≈ 568亿，足够用）
2. 存储：Redis缓存 + MySQL持久化
3. 性能：读多写少，缓存要做好
4. 过期策略：短链接可以设置有效期
5. 防刷：生成接口要限流`,
    pitfalls: [
      {
        title: '自增ID的安全性问题',
        description: '用自增ID生成短码，别人很容易遍历所有短链接（只要依次试就行了）。如果有敏感数据，可能会被爬取。可以：1. 加盐混淆；2. 不用连续ID，用雪花算法；3. 加访问控制。',
        severity: 'medium',
      },
      {
        title: '301还是302重定向',
        description: '301是永久重定向，浏览器会缓存，下次直接跳长链接（服务端拿不到统计数据）；302是临时重定向，每次都会请求短链接服务端。要做统计就用302，要省流量就用301。各有利弊，看业务需求。',
        severity: 'medium',
      },
      {
        title: '短码冲突的概率',
        description: '有人担心6位短码会不会很快用完。62^6是568亿，就算每天生成100万条，也够用1500多年。真正的问题不是数量不够，而是：1. 哈希冲突怎么处理；2. 恶意刷接口消耗短码。',
        severity: 'low',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// 62进制转换工具
private static final String CHARS = 
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

public static String idToShortCode(long id) {
    StringBuilder sb = new StringBuilder();
    while (id > 0) {
        sb.append(CHARS.charAt((int)(id % 62)));
        id = id / 62;
    }
    return sb.reverse().toString();
}`,
      },
    ],
    relatedQuestionIds: ['sd-1', 'sd-3'],
    isHot: false,
  },
  {
    id: 'sd-3',
    title: '如何设计一个高可用的分布式系统？',
    categoryId: 'system-design',
    difficulty: 'hard',
    content: '什么是高可用？如何设计一个99.99%可用性的分布式系统？有哪些常用的技术手段？',
    standardSolution: `**高可用（High Availability）**：系统无中断地执行其功能的能力，通常用"几个9"来衡量。

**可用性计算公式：**
- 99% → 年停机约3.65天
- 99.9% → 年停机约8.76小时
- 99.99% → 年停机约52.56分钟
- 99.999% → 年停机约5.26分钟

**高可用设计的核心思想：冗余 + 故障转移**

**常用技术手段：**

**1. 应用层高可用**
- 集群部署：多实例部署，负载均衡
- 无状态设计：便于水平扩展
- 服务降级：非核心功能可降级
- 熔断机制：防止故障蔓延

**2. 数据层高可用**
- 主从复制：一主多从，读写分离
- 多副本：数据多副本存储（如RAID、分布式存储）
- 数据备份：定时备份 + 异地容灾
- 分库分表：避免单点瓶颈

**3. 基础设施高可用**
- 多机房部署：同城双活 / 异地多活
- 网络冗余：多条线路、多运营商
- 电源冗余：UPS、发电机
- 监控告警：及时发现故障

**4. 故障转移机制**
- 心跳检测：定期检查节点健康
- 自动切换：故障时自动切换到备用节点
- 服务发现：动态感知节点上下线`,
    pitfalls: [
      {
        title: '高可用不是堆机器就行',
        description: '很多人觉得高可用就是多部署几台机器。实际上如果架构设计有问题（如单点依赖、强一致要求），堆再多机器也没用。高可用是系统工程，涉及架构、运维、监控、流程等方方面面。',
        severity: 'medium',
      },
      {
        title: '小心"高可用"反而降低可用性',
        description: '为了高可用引入复杂的分布式方案，结果因为系统太复杂，经常出问题，反而不如简单的单系统稳定。复杂度本身就是可用性的敌人。要在满足业务需求的前提下，尽量保持简单。',
        severity: 'high',
      },
      {
        title: '故障转移不是免费的',
        description: '主从切换、故障转移不是瞬间完成的，中间会有短暂的不可用（几秒到几分钟）。而且切换过程中可能出现数据不一致、脏数据等问题。要评估切换的代价和风险。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'java',
        code: `// 熔断器模式（简单实现）
public class CircuitBreaker {
    private enum State { CLOSED, OPEN, HALF_OPEN }
    private State state = State.CLOSED;
    private int failureCount = 0;
    private int failureThreshold = 5;
    private long openTimeout = 30000;
    private long lastFailureTime = 0;

    public void recordSuccess() {
        if (state == State.HALF_OPEN) {
            state = State.CLOSED;
        }
        failureCount = 0;
    }

    public void recordFailure() {
        failureCount++;
        if (failureCount >= failureThreshold) {
            state = State.OPEN;
            lastFailureTime = System.currentTimeMillis();
        }
    }

    public boolean canInvoke() {
        if (state == State.CLOSED) return true;
        if (state == State.OPEN) {
            if (System.currentTimeMillis() - lastFailureTime > openTimeout) {
                state = State.HALF_OPEN;
                return true;
            }
            return false;
        }
        return true; // HALF_OPEN
    }
}`,
      },
    ],
    relatedQuestionIds: ['sd-1', 'sd-2'],
    isHot: true,
  },
  // ========== Python 题目 ==========
  {
    id: 'py-1',
    title: 'Python中的GIL是什么？',
    categoryId: 'python',
    difficulty: 'medium',
    content: '什么是GIL（全局解释器锁）？它对Python多线程有什么影响？为什么会有GIL？',
    standardSolution: `**GIL（Global Interpreter Lock）** 是Python解释器中的一把全局互斥锁，确保同一时刻只有一个线程在执行Python字节码。

**GIL的作用：**
- 保护Python解释器内部的数据结构
- 简化内存管理，避免多线程竞态条件
- CPython的内存管理（引用计数）不是线程安全的

**对多线程的影响：**
1. CPU密集型任务：多线程无法利用多核，甚至比单线程更慢（线程切换开销）
2. IO密集型任务：多线程仍然有效，因为IO等待时GIL会被释放

**为什么有GIL：**
- 历史原因：Python诞生时还没有多核CPU
- 简化C扩展开发，C扩展不需要考虑线程安全
- 单线程下性能好`,
    pitfalls: [
      {
        title: '多线程不等于并行',
        description: '很多人以为开多线程就能利用多核CPU，实际上因为GIL的存在，CPython的多线程在CPU密集型任务下是串行执行的。CPU密集型任务应该用多进程（multiprocessing）。',
        severity: 'high',
      },
      {
        title: 'IO密集型用多线程没问题',
        description: 'GIL在IO等待时会被释放（time.sleep、网络IO、文件IO等），所以IO密集型任务用多线程还是能提升性能的。不要一谈GIL就否定所有多线程。',
        severity: 'medium',
      },
      {
        title: '不是所有Python实现都有GIL',
        description: 'GIL是CPython的特性，不是Python语言的特性。Jython、IronPython等实现没有GIL。但大部分人用的是CPython，所以面试时默认讨论的是CPython。',
        severity: 'low',
      },
    ],
    codeExamples: [
      {
        language: 'python',
        code: `# CPU密集型任务：多线程反而更慢
import threading
import time

def cpu_bound_task(n):
    result = 0
    for i in range(n):
        result += i
    return result

# 单线程
start = time.time()
cpu_bound_task(10000000)
cpu_bound_task(10000000)
print(f"单线程耗时: {time.time() - start:.2f}s")

# 多线程
start = time.time()
t1 = threading.Thread(target=cpu_bound_task, args=(10000000,))
t2 = threading.Thread(target=cpu_bound_task, args=(10000000,))
t1.start()
t2.start()
t1.join()
t2.join()
print(f"多线程耗时: {time.time() - start:.2f}s")
# 结论：多线程反而更慢！`,
      },
    ],
    relatedQuestionIds: ['py-2', 'py-3'],
    isHot: true,
  },
  {
    id: 'py-2',
    title: 'Python的装饰器是什么？',
    categoryId: 'python',
    difficulty: 'medium',
    content: '什么是装饰器（Decorator）？它的实现原理是什么？有哪些应用场景？',
    standardSolution: `**装饰器**是一种设计模式，用于在不修改原函数代码的情况下，动态地给函数添加功能。

**实现原理：**
- Python中函数是一等公民（可以作为参数传递、返回值、赋值给变量）
- 装饰器本质上是一个高阶函数，接收函数作为参数，返回一个新的函数
- 语法糖：@decorator_name

**常见应用场景：**
1. 日志记录
2. 性能统计
3. 权限校验
4. 缓存（如lru_cache）
5. 事务处理
6. 输入验证

**装饰器的执行顺序：**
- 多个装饰器时，从上到下装饰，从下到上执行
- 类似洋葱模型`,
    pitfalls: [
      {
        title: '装饰器会丢失原函数的元信息',
        description: '普通装饰器会让原函数的__name__、__doc__等属性变成包装函数的。解决方法是使用 functools.wraps 装饰器，把原函数的元信息拷贝到包装函数中。这是新手最容易忽略的细节。',
        severity: 'high',
      },
      {
        title: '带参数的装饰器需要多一层函数',
        description: '很多人写带参数的装饰器时容易搞混层级。带参数的装饰器实际上是"装饰器工厂"——先调用外层函数得到真正的装饰器，再用这个装饰器去装饰函数。所以比普通装饰器多了一层函数嵌套。',
        severity: 'medium',
      },
      {
        title: '类装饰器vs函数装饰器',
        description: '装饰器不仅可以是函数，还可以是类。类装饰器需要实现 __call__ 方法。类装饰器适合维护状态（比如统计调用次数），函数装饰器更简单直接。',
        severity: 'low',
      },
    ],
    codeExamples: [
      {
        language: 'python',
        code: `# 标准的装饰器写法（带functools.wraps）
import functools
import time

def timer(func):
    @functools.wraps(func)  # 必须加！保留原函数元信息
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} 耗时: {time.time() - start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
    return "done"

# 带参数的装饰器
def repeat(times):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(times=3)
def greet(name):
    print(f"Hello, {name}!")`,
      },
    ],
    relatedQuestionIds: ['py-1', 'py-4'],
    isHot: true,
  },
  {
    id: 'py-3',
    title: 'Python中的深拷贝和浅拷贝有什么区别？',
    categoryId: 'python',
    difficulty: 'easy',
    content: '什么是深拷贝？什么是浅拷贝？它们有什么区别？分别在什么场景下使用？',
    standardSolution: `**浅拷贝（Shallow Copy）：**
- 创建一个新对象，但只拷贝对象的引用
- 对于可变对象的子对象，仍然共享同一份数据
- 实现方式：切片、copy.copy()、工厂函数、对象的copy方法

**深拷贝（Deep Copy）：**
- 创建一个新对象，并且递归拷贝所有子对象
- 新对象和原对象完全独立，互不影响
- 实现方式：copy.deepcopy()

**赋值 vs 浅拷贝 vs 深拷贝：**
- 赋值（=）：只是增加一个引用，不创建新对象
- 浅拷贝：创建新对象，但子对象共享
- 深拷贝：创建新对象，所有子对象也都是新的`,
    pitfalls: [
      {
        title: '不可变对象的拷贝很特殊',
        description: '对于不可变对象（int、str、tuple等），浅拷贝和深拷贝没有区别，因为对象本身不能修改，不需要真正拷贝。但如果tuple里包含可变对象，深拷贝还是会递归拷贝里面的可变对象。',
        severity: 'medium',
      },
      {
        title: '深拷贝的性能问题',
        description: '深拷贝需要递归遍历整个对象结构，如果对象嵌套很深或者很大，深拷贝会很慢，还可能出现循环引用导致的栈溢出（不过copy.deepcopy做了循环引用检测）。能用浅拷贝就不要用深拷贝。',
        severity: 'medium',
      },
      {
        title: '列表切片是浅拷贝',
        description: '很多人以为 list[:] 是深拷贝，其实它只是浅拷贝。对于一维列表且元素都是不可变类型时，效果和深拷贝一样。但如果列表里有列表、字典等可变对象，修改子对象会互相影响。',
        severity: 'high',
      },
    ],
    codeExamples: [
      {
        language: 'python',
        code: `import copy

# 浅拷贝的问题
original = [[1, 2], [3, 4]]
shallow = copy.copy(original)

# 修改子对象
shallow[0].append(5)
print(original)  # [[1, 2, 5], [3, 4]] —— 原对象也变了！
print(shallow)   # [[1, 2, 5], [3, 4]]

# 深拷贝
original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)

deep[0].append(5)
print(original)  # [[1, 2], [3, 4]] —— 原对象不变
print(deep)      # [[1, 2, 5], [3, 4]]

# 赋值 vs 拷贝
a = [1, 2, 3]
b = a              # 赋值，同一对象
c = a.copy()       # 浅拷贝
a.append(4)
print(b)  # [1, 2, 3, 4] —— b也变了
print(c)  # [1, 2, 3] —— c不变`,
      },
    ],
    relatedQuestionIds: ['py-2', 'py-5'],
    isHot: false,
  },
  {
    id: 'py-4',
    title: 'Python的生成器和迭代器有什么区别？',
    categoryId: 'python',
    difficulty: 'medium',
    content: '什么是迭代器（Iterator）？什么是生成器（Generator）？它们有什么关系和区别？',
    standardSolution: `**迭代器（Iterator）：**
- 实现了 __iter__() 和 __next__() 方法的对象
- __iter__() 返回迭代器自身
- __next__() 返回下一个元素，没有元素时抛出StopIteration
- 只能遍历一次，遍历完就空了
- 惰性计算，节省内存

**生成器（Generator）：**
- 是一种特殊的迭代器，写法更简洁
- 使用 yield 关键字的函数就是生成器函数
- 调用生成器函数返回生成器对象，函数体并不立即执行
- 每次调用 next() 时执行到下一个 yield 处暂停

**可迭代对象（Iterable）：**
- 实现了 __iter__() 方法的对象
- 可以被 for 循环遍历
- list、dict、str 等都是可迭代对象

**关系：**
生成器 ⊂ 迭代器 ⊂ 可迭代对象`,
    pitfalls: [
      {
        title: '生成器只能遍历一次',
        description: '很多人以为生成器像列表一样可以重复遍历，实际上生成器是一次性的——遍历完就空了。如果需要多次使用，每次都要重新创建生成器，或者转成列表保存。',
        severity: 'high',
      },
      {
        title: 'yield from不是语法糖那么简单',
        description: 'yield from 不只是简化嵌套生成器的写法，它还会自动处理子生成器的StopIteration异常、传递值和异常等。在协程中，yield from是实现双向通信的关键。',
        severity: 'medium',
      },
      {
        title: '生成器的send()方法',
        description: '生成器不仅可以产出值，还可以通过send()方法接收外部传入的值。send(None)和next()效果一样。第一次调用必须用next()或send(None)启动生成器，不能直接send一个非None值。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'python',
        code: `# 自定义迭代器
class CountDown:
    def __init__(self, n):
        self.n = n
    
    def __iter__(self):
        return self
    
    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n

# 生成器（更简洁）
def countdown(n):
    while n > 0:
        n -= 1
        yield n

# 生成器的send()方法
def echo_generator():
    msg = "start"
    for _ in range(3):
        incoming = yield msg
        if incoming is not None:
            msg = incoming + " received"
        else:
            msg = "next"

gen = echo_generator()
print(next(gen))        # start
print(gen.send("hi"))   # hi received
print(gen.send("bye"))  # bye received

# yield from 用于委托子生成器
def nested_generator():
    yield from [1, 2, 3]
    yield from (x for x in range(4, 7))`,
      },
    ],
    relatedQuestionIds: ['py-1', 'py-5'],
    isHot: true,
  },
  {
    id: 'py-5',
    title: 'Python中的闭包是什么？',
    categoryId: 'python',
    difficulty: 'hard',
    content: '什么是闭包（Closure）？闭包有什么用？常见的坑有哪些？',
    standardSolution: `**闭包**是指函数和其引用环境的组合。简单说就是：内部函数引用了外部函数的变量，并且外部函数已经执行完毕，内部函数仍然能访问到那些变量。

**闭包的三要素：**
1. 嵌套函数（函数内定义函数）
2. 内部函数引用外部函数的变量
3. 外部函数返回内部函数

**闭包的作用：**
- 保存状态（类似面向对象的实例变量）
- 实现装饰器
- 实现单例模式
- 延迟计算

**常见问题：**
- 闭包中的变量是引用，不是值
- 循环变量的陷阱
- 修改外部变量需要nonlocal声明`,
    pitfalls: [
      {
        title: '循环变量的经典坑',
        description: '在循环中创建闭包，所有闭包共享同一个循环变量，最后所有闭包都引用循环变量的最终值。解决方法是用默认参数（默认参数在定义时求值），或者用functools.partial。这是经典面试坑！',
        severity: 'high',
      },
      {
        title: '修改外部变量需要nonlocal',
        description: '闭包中可以读取外部变量，但如果要修改（重新赋值），必须用 nonlocal 关键字声明，不然会被当成局部变量。这是Python的作用域规则决定的——赋值即定义。',
        severity: 'high',
      },
      {
        title: '闭包不是万能的',
        description: '闭包虽然能保存状态，但比类更难调试和理解。如果状态很多、逻辑很复杂，不如直接用类。闭包适合简单的状态保存和装饰器等场景。',
        severity: 'low',
      },
    ],
    codeExamples: [
      {
        language: 'python',
        code: `# 闭包示例
def make_counter():
    count = 0
    def counter():
        nonlocal count  # 修改外部变量必须声明
        count += 1
        return count
    return counter

c1 = make_counter()
print(c1())  # 1
print(c1())  # 2
print(c1())  # 3

# 经典坑：循环变量问题
def create_functions_bad():
    funcs = []
    for i in range(3):
        def f():
            return i  # 所有函数共享同一个i！
        funcs.append(f)
    return funcs

funcs = create_functions_bad()
print(funcs[0]())  # 2 —— 不是0！
print(funcs[1]())  # 2 —— 不是1！
print(funcs[2]())  # 2 —— 都是2！

# 正确写法：用默认参数
def create_functions_good():
    funcs = []
    for i in range(3):
        def f(i=i):  # 默认参数在定义时求值
            return i
        funcs.append(f)
    return funcs

funcs = create_functions_good()
print(funcs[0]())  # 0
print(funcs[1]())  # 1
print(funcs[2]())  # 2`,
      },
    ],
    relatedQuestionIds: ['py-2', 'py-4'],
    isHot: false,
  },
  // ========== Go 题目 ==========
  {
    id: 'go-1',
    title: 'Go中的goroutine和线程有什么区别？',
    categoryId: 'go',
    difficulty: 'medium',
    content: 'goroutine是什么？它和操作系统线程有什么区别？为什么goroutine更轻量？',
    standardSolution: `**goroutine**是Go语言中的轻量级线程，由Go runtime管理，而不是操作系统管理。

**与线程的区别：**

1. **创建代价**
   - 线程：创建代价高，需要分配栈空间（通常几MB）
   - goroutine：创建代价低，初始栈只有2KB，可按需扩容

2. **调度方式**
   - 线程：由操作系统内核调度，上下文切换代价高
   - goroutine：由Go runtime调度，用户态调度，切换快

3. **数量级**
   - 线程：几千个就可能耗尽资源
   - goroutine：轻松创建几十万甚至上百万个

4. **栈空间**
   - 线程：栈空间固定且较大（通常1-8MB）
   - goroutine：初始2KB，可动态伸缩（最大通常1GB）

**G-M-P模型：**
- G：goroutine
- M：操作系统线程
- P：处理器，管理goroutine队列`,
    pitfalls: [
      {
        title: 'goroutine不是越多越好',
        description: '很多人以为goroutine轻量就可以无限制开。虽然goroutine本身占内存少，但如果每个goroutine都持有大量内存或者导致频繁GC，还是会出问题。而且goroutine太多也会增加调度开销。',
        severity: 'medium',
      },
      {
        title: 'goroutine泄漏很常见',
        description: 'goroutine如果没有正确退出（比如阻塞在channel上没人管、无限循环没退出条件），就会发生goroutine泄漏。泄漏的goroutine会一直占用内存，长期运行可能导致OOM。要注意goroutine的生命周期管理。',
        severity: 'high',
      },
      {
        title: '不是所有阻塞都会让出线程',
        description: 'Go runtime对很多阻塞做了优化（网络IO、channel等），阻塞时会让出M给其他goroutine。但如果是系统调用阻塞（比如Cgo调用、文件IO），M会被阻塞，P会被调度到其他M上。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'go',
        code: `// 简单的goroutine示例
package main

import (
    "fmt"
    "sync"
    "time"
)

func sayHello(name string, wg *sync.WaitGroup) {
    defer wg.Done() // 任务完成时通知
    time.Sleep(100 * time.Millisecond)
    fmt.Printf("Hello, %s!\\n", name)
}

func main() {
    var wg sync.WaitGroup
    
    // 启动1000个goroutine毫无压力
    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go sayHello(fmt.Sprintf("User%d", i), &wg)
    }
    
    wg.Wait() // 等待所有goroutine完成
    fmt.Println("All done!")
}

// goroutine泄漏的反例
func leakyFunction() {
    ch := make(chan int)
    go func() {
        // 这个goroutine会一直阻塞在这，没人close channel
        // 函数返回后goroutine还在，泄漏了！
        val := <-ch
        fmt.Println(val)
    }()
    // 注意：要确保goroutine有退出路径
}`,
      },
    ],
    relatedQuestionIds: ['go-2', 'go-3'],
    isHot: true,
  },
  {
    id: 'go-2',
    title: 'Go中的channel是什么？',
    categoryId: 'go',
    difficulty: 'medium',
    content: 'channel是什么？有缓冲和无缓冲channel有什么区别？channel有哪些常见用法？',
    standardSolution: `**channel**是Go语言中goroutine之间的通信机制，用于在不同goroutine之间传递数据。

**核心概念：**
- 不要通过共享内存来通信，而要通过通信来共享内存
- channel是类型安全的，只能传递指定类型的数据
- 发送和接收操作都是原子的

**无缓冲channel：**
- 发送方会阻塞，直到有接收方接收
- 接收方会阻塞，直到有发送方发送
- 可以用于goroutine之间的同步

**有缓冲channel：**
- 有一个缓冲区，缓冲区满了发送方才阻塞
- 缓冲区空了接收方才阻塞
- 可以用于解耦生产者和消费者

**常见用法：**
1. goroutine通信
2. 同步等待
3. 限流（信号量）
4. 生产者消费者模式
5. 超时控制`,
    pitfalls: [
      {
        title: '关闭已关闭的channel会panic',
        description: '重复关闭channel或者向已关闭的channel发送数据都会导致panic。关闭channel的原则是：只由发送方关闭，而且只能关闭一次。如果有多个发送方，要用额外的机制协调（比如sync.Once或者专门的关闭goroutine）。',
        severity: 'high',
      },
      {
        title: '从nil channel阻塞会永久阻塞',
        description: '向nil channel发送或接收数据都会永久阻塞，不会panic也不会报错。如果不小心把channel设为nil了，goroutine就卡在那里了，而且很难排查。声明了channel一定要记得初始化。',
        severity: 'high',
      },
      {
        title: 'channel不是万能的',
        description: 'channel虽然是Go的特色，但不是所有并发场景都适合用channel。简单的场景用互斥锁可能更高效、更清晰。channel适合数据流和协调，mutex适合保护共享数据。',
        severity: 'low',
      },
    ],
    codeExamples: [
      {
        language: 'go',
        code: `package main

import (
    "fmt"
    "time"
)

// 无缓冲channel用于同步
func unbufferedChannel() {
    ch := make(chan string)
    
    go func() {
        time.Sleep(100 * time.Millisecond)
        ch <- "hello" // 发送方会阻塞，直到有人接收
    }()
    
    msg := <-ch // 接收方也会阻塞，直到有人发送
    fmt.Println(msg)
}

// 有缓冲channel
func bufferedChannel() {
    ch := make(chan int, 3) // 容量为3
    
    ch <- 1 // 不会阻塞
    ch <- 2 // 不会阻塞
    ch <- 3 // 不会阻塞
    // ch <- 4 // 第四个会阻塞
    
    fmt.Println(<-ch) // 1
    fmt.Println(<-ch) // 2
}

// 用channel做信号量限流
func workerPool() {
    sem := make(chan struct{}, 3) // 最多3个并发
    
    for i := 0; i < 10; i++ {
        go func(i int) {
            sem <- struct{}{} // 获取信号量
            defer func() { <-sem }() // 释放信号量
            
            fmt.Printf("Worker %d working\\n", i)
            time.Sleep(100 * time.Millisecond)
        }(i)
    }
    
    time.Sleep(500 * time.Millisecond)
}

func main() {
    unbufferedChannel()
    bufferedChannel()
    workerPool()
}`,
      },
    ],
    relatedQuestionIds: ['go-1', 'go-4'],
    isHot: true,
  },
  {
    id: 'go-3',
    title: 'Go的GMP调度模型是什么？',
    categoryId: 'go',
    difficulty: 'hard',
    content: 'Go语言的GMP调度模型是什么？G、M、P分别代表什么？调度的大致流程是怎样的？',
    standardSolution: `**GMP模型**是Go runtime的调度模型，用于高效地调度goroutine。

**三个核心概念：**

1. **G（Goroutine）**
   - 就是goroutine，Go语言的并发单元
   - 包含栈、指令指针、状态等信息
   - 数量可以很多（几十万甚至更多）

2. **M（Machine）**
   - 操作系统线程
   - 真正执行代码的实体
   - 数量通常和CPU核心数差不多

3. **P（Processor）**
   - 处理器，管理goroutine队列
   - 每个P有一个本地goroutine队列（LRQ）
   - 还有一个全局goroutine队列（GRQ）
   - P的数量由GOMAXPROCS决定，默认等于CPU核心数

**调度流程：**
1. M需要绑定P才能执行G
2. M从P的本地队列取G执行
3. 本地队列为空时，去全局队列取
4. 全局队列也空时，去其他P的队列偷（work stealing）

**调度时机：**
- goroutine调用channel阻塞时
- goroutine调用syscall时
- 协作式调度：函数调用时可能触发
- 抢占式调度：运行时间太长会被抢占`,
    pitfalls: [
      {
        title: 'GOMAXPROCS不是越大越好',
        description: '很多人以为GOMAXPROCS设得越大越好，实际上P太多会增加调度开销，降低CPU缓存命中率，反而降低性能。默认值（CPU核心数）通常是最优的，在容器环境要注意是否正确获取到了CPU配额。',
        severity: 'medium',
      },
      {
        title: '系统调用会占用M但不占用P',
        description: '当G发起系统调用时，M会被阻塞，但P会和M解绑，P可以去绑定另一个M继续执行其他G。系统调用返回后，G会尝试找一个空闲的P继续执行，如果找不到就放到全局队列。',
        severity: 'medium',
      },
      {
        title: 'work stealing不是随便偷',
        description: 'work stealing策略是：P从其他P的队列尾部偷一半的G。这样既保证了负载均衡，又能充分利用CPU缓存的局部性（自己队列头部的G可能还在缓存里）。',
        severity: 'low',
      },
    ],
    codeExamples: [
      {
        language: 'go',
        code: `package main

import (
    "fmt"
    "runtime"
    "sync"
)

func main() {
    // 查看GOMAXPROCS
    fmt.Println("GOMAXPROCS:", runtime.GOMAXPROCS(0))
    
    // 设置GOMAXPROCS
    runtime.GOMAXPROCS(4)
    
    // 设置为CPU核心数
    numCPU := runtime.NumCPU()
    fmt.Println("CPU cores:", numCPU)
    runtime.GOMAXPROCS(numCPU)
    
    // 查看当前goroutine数量
    var wg sync.WaitGroup
    for i := 0; i < 100; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            // ... some work
        }()
    }
    
    fmt.Println("Goroutine count:", runtime.NumGoroutine())
    wg.Wait()
}

// 调度相关的其他概念
// 1. 抢占式调度：Go 1.14引入了基于信号的异步抢占
// 2. netpoller：网络IO复用，阻塞IO不阻塞M
// 3. 自旋线程：减少M的创建和销毁

// 注意：GMP调度是Go的核心概念，但日常开发中
// 通常不需要手动干预调度，了解原理有助于
// 排查性能问题和理解Go的并发模型`,
      },
    ],
    relatedQuestionIds: ['go-1', 'go-5'],
    isHot: false,
  },
  {
    id: 'go-4',
    title: 'Go中的defer是什么？',
    categoryId: 'go',
    difficulty: 'easy',
    content: 'defer关键字有什么用？defer的执行顺序是怎样的？有哪些常见的坑？',
    standardSolution: `**defer**用于注册延迟调用，在函数返回之前执行defer的语句。

**主要用途：**
- 释放资源（关闭文件、释放锁、关闭连接等）
- 清理操作
- panic恢复（配合recover）

**执行顺序：**
- 多个defer按后进先出（LIFO）顺序执行
- 先注册的后执行，后注册的先执行
- 类似栈的结构

**执行时机：**
1. 函数中defer语句被注册
2. 函数返回前，按逆序执行所有defer
3. 然后函数真正返回

**注意：**
- defer函数的参数在defer语句处求值
- 命名返回值和defer的交互很容易搞错`,
    pitfalls: [
      {
        title: 'defer参数是立即求值的',
        description: 'defer语句中的函数参数在声明defer的时候就已经求值了，不是在执行的时候才求值。如果参数是变量，保存的是当时的值。这是最常见的坑之一！',
        severity: 'high',
      },
      {
        title: '循环中使用defer可能出问题',
        description: '在for循环里写defer，所有defer都会在函数返回时才执行，不是每次循环结束就执行。如果循环次数很多，可能会积累大量延迟调用，占用内存。要注意defer的作用域。',
        severity: 'high',
      },
      {
        title: 'defer和return的顺序很微妙',
        description: 'return不是原子操作，分为：1) 给返回值赋值；2) 执行defer；3) 函数返回。所以defer可以修改命名返回值，但不能改变已经赋值的返回值（除非是命名返回值）。这是高频面试题。',
        severity: 'high',
      },
    ],
    codeExamples: [
      {
        language: 'go',
        code: `package main

import "fmt"

// defer的执行顺序
func deferOrder() {
    defer fmt.Println("first defer")
    defer fmt.Println("second defer")
    defer fmt.Println("third defer")
    // 输出顺序：third second first（后进先出）
}

// defer参数立即求值的坑
func deferArgEval() {
    i := 0
    defer fmt.Println("defer i:", i) // 输出0，不是2！
    i++
    i++
    fmt.Println("function i:", i) // 输出2
}

// 正确写法：用闭包延迟求值
func deferClosure() {
    i := 0
    defer func() {
        fmt.Println("defer i:", i) // 输出2，闭包引用变量
    }()
    i++
    i++
}

// defer和命名返回值
func deferNamedReturn() (result int) {
    defer func() {
        result++ // 可以修改命名返回值
    }()
    return 10 // 返回11
}

// defer和非命名返回值
func deferAnonReturn() int {
    result := 10
    defer func() {
        result++ // 改不到返回值！
    }()
    return result // 还是返回10
}

// 循环中使用defer的问题
func loopDeferBad() {
    for i := 0; i < 100; i++ {
        // 不好：所有defer都累积到函数结束才执行
        defer fmt.Println(i)
    }
}

// 更好的写法
func loopDeferGood() {
    for i := 0; i < 100; i++ {
        func() {
            // 在匿名函数中使用defer
            defer fmt.Println(i)
        }()
    }
}

func main() {
    deferOrder()
    deferArgEval()
    fmt.Println("named return:", deferNamedReturn())
    fmt.Println("anon return:", deferAnonReturn())
}`,
      },
    ],
    relatedQuestionIds: ['go-2', 'go-5'],
    isHot: true,
  },
  {
    id: 'go-5',
    title: 'Go中的slice和array有什么区别？',
    categoryId: 'go',
    difficulty: 'easy',
    content: 'slice（切片）和array（数组）有什么区别？slice的底层结构是怎样的？append有什么坑？',
    standardSolution: `**数组（Array）：**
- 长度是类型的一部分，固定长度，不能改变
- 值类型，赋值或传参时会拷贝整个数组
- 长度必须在编译期确定

**切片（Slice）：**
- 动态长度，可以扩容
- 引用类型，底层指向一个数组
- 三个字段：指针（指向底层数组）、长度、容量

**slice的结构：**
- ptr：指向底层数组的指针
- len：当前元素个数
- cap：底层数组的容量

**append的行为：**
- 如果容量足够，就在原数组上追加，返回的slice还是指向原数组
- 如果容量不够，会分配新的底层数组，拷贝数据，然后追加
- 扩容策略：小于1024时2倍扩容，大于1024时1.25倍扩容`,
    pitfalls: [
      {
        title: '切片共享底层数组的坑',
        description: '从一个大切片切出来的小切片，它们共享同一个底层数组。如果修改小切片的元素，大切片也会变。而且如果小切片一直存在，大切片占用的内存就不会被GC回收，可能导致内存泄漏。',
        severity: 'high',
      },
      {
        title: 'append可能返回新的底层数组',
        description: '很多人以为append是在原地追加，实际上当容量不够时，append会返回一个指向新数组的切片。所以append的结果一定要赋值回去，不然可能就丢了。而且不同的变量可能指向不同的底层数组。',
        severity: 'high',
      },
      {
        title: '空切片和nil切片不同',
        description: 'var s []int 是nil切片（nil slice），s := make([]int, 0)是空切片（empty slice）。它们的len和cap都是0，但nil切片的指针是nil。虽然很多情况下它们行为一样（len(s)都为0），但在某些场景下（比如JSON序列化）表现不同。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'go',
        code: `package main

import "fmt"

func main() {
    // 数组 vs 切片
    var arr [3]int // 数组，长度是类型的一部分
    fmt.Println("array:", arr, len(arr))
    
    s := make([]int, 3) // 切片，动态长度
    fmt.Println("slice:", s, len(s), cap(s))
    
    // 共享底层数组的坑
    big := []int{1, 2, 3, 4, 5}
    small := big[1:3]
    fmt.Println("before: big =", big)  // [1 2 3 4 5]
    fmt.Println("before: small =", small) // [2 3]
    
    small[0] = 99
    fmt.Println("after: big =", big)    // [1 99 3 4 5] —— 大切片也变了！
    fmt.Println("after: small =", small) // [99 3]
    
    // append可能创建新数组
    s1 := make([]int, 3, 3) // len=3, cap=3
    s2 := append(s1, 4)     // 容量不够，会扩容
    s2[0] = 99
    fmt.Println("s1:", s1) // [0 0 0] —— s1不变
    fmt.Println("s2:", s2) // [99 0 0 4] —— 新数组
    
    // 容量足够时共享数组
    s3 := make([]int, 3, 5) // len=3, cap=5
    s4 := append(s3, 4)     // 容量够，不扩容
    s4[0] = 99
    fmt.Println("s3:", s3) // [99 0 0] —— s3也变了！
    fmt.Println("s4:", s4) // [99 0 0 4]
    
    // nil切片 vs 空切片
    var nilSlice []int
    emptySlice := make([]int, 0)
    fmt.Println("nil slice:", nilSlice, len(nilSlice), cap(nilSlice), nilSlice == nil) // true
    fmt.Println("empty slice:", emptySlice, len(emptySlice), cap(emptySlice), emptySlice == nil) // false
}`,
      },
    ],
    relatedQuestionIds: ['go-3', 'go-4'],
    isHot: true,
  },
  // ========== JavaScript 题目 ==========
  {
    id: 'js-1',
    title: 'JavaScript中的闭包是什么？',
    categoryId: 'javascript',
    difficulty: 'medium',
    content: '什么是闭包（Closure）？闭包有什么用？常见的应用场景有哪些？',
    standardSolution: `**闭包**是指函数和其词法环境的组合。简单说就是：内部函数可以访问外部函数的变量，即使外部函数已经执行完毕。

**闭包的三个特性：**
1. 函数嵌套函数
2. 内部函数可以引用外部函数的参数和变量
3. 参数和变量不会被垃圾回收机制回收

**常见应用场景：**
1. 数据私有化（封装）
2. 函数柯里化
3. 防抖和节流
4. 模块化
5. 保存状态（如计数器）
6. 回调函数和事件处理函数

**闭包的优缺点：**
- 优点：可以私有化变量，避免全局污染
- 缺点：滥用闭包会导致内存泄漏`,
    pitfalls: [
      {
        title: '循环中闭包的经典坑',
        description: '在循环中创建闭包，所有闭包共享同一个循环变量，最后所有闭包都引用循环变量的最终值。解决方法：用立即执行函数（IIFE）创建独立作用域，或者用let声明（let有块级作用域）。这是前端经典面试题！',
        severity: 'high',
      },
      {
        title: '闭包可能导致内存泄漏',
        description: '闭包会持有外部函数的变量引用，如果闭包一直存在（比如事件监听器没移除、定时器没清除），这些变量就不会被GC回收，导致内存泄漏。使用闭包要注意及时清理（移除事件监听、清除定时器）。',
        severity: 'high',
      },
      {
        title: 'this指向不是闭包问题',
        description: '很多人把this指向的问题也归为闭包问题，其实不是。this的指向是由调用方式决定的，和闭包是两回事。虽然闭包里也可能遇到this问题，但那是this的问题，不是闭包本身的问题。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'javascript',
        code: `// 经典闭包例子：计数器
function createCounter() {
  let count = 0; // 私有变量
  
  return {
    increment: function() {
      count++;
      return count;
    },
    decrement: function() {
      count--;
      return count;
    },
    getCount: function() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount());  // 2
console.log(counter.count);       // undefined —— 访问不到私有变量

// 经典坑：循环中的闭包
// 错误写法（var没有块级作用域）
function loopClosureBad() {
  var funcs = [];
  for (var i = 0; i < 3; i++) {
    funcs.push(function() {
      console.log(i); // 所有函数共享同一个i
    });
  }
  return funcs;
}

const badFuncs = loopClosureBad();
badFuncs[0](); // 3 —— 不是0！
badFuncs[1](); // 3 —— 不是1！
badFuncs[2](); // 3 —— 都是3！

// 正确写法1：用IIFE创建独立作用域
function loopClosureIIFE() {
  var funcs = [];
  for (var i = 0; i < 3; i++) {
    (function(j) {
      funcs.push(function() {
        console.log(j);
      });
    })(i);
  }
  return funcs;
}

// 正确写法2：用let（块级作用域）
function loopClosureLet() {
  var funcs = [];
  for (let i = 0; i < 3; i++) { // let有块级作用域
    funcs.push(function() {
      console.log(i);
    });
  }
  return funcs;
}`,
      },
    ],
    relatedQuestionIds: ['js-2', 'js-3'],
    isHot: true,
  },
  {
    id: 'js-2',
    title: 'JavaScript中的原型和原型链是什么？',
    categoryId: 'javascript',
    difficulty: 'hard',
    content: '什么是原型（prototype）？什么是原型链？__proto__和prototype有什么区别？',
    standardSolution: `**原型（prototype）：**
- 每个函数都有一个prototype属性，指向一个对象
- 这个对象是该函数所有实例的原型
- 原型上的属性和方法，所有实例都可以共享

**__proto__（隐式原型）：**
- 每个对象都有__proto__属性
- 指向构造该对象的构造函数的prototype
- obj.__proto__ === Constructor.prototype

**原型链：**
- 当访问对象的属性时，如果对象本身没有，就会去它的__proto__上找
- 如果还找不到，就继续往上找__proto__.__proto__
- 一直找到null为止（Object.prototype.__proto__ === null）
- 这条链就叫原型链

**相关概念：**
- constructor：原型对象的constructor属性，指向构造函数
- instanceof：判断一个对象是否是某个构造函数的实例`,
    pitfalls: [
      {
        title: '__proto__不是标准属性',
        description: '__proto__是浏览器厂商实现的非标准属性，虽然大部分浏览器都支持，但规范上不推荐直接使用。推荐用Object.getPrototypeOf()和Object.setPrototypeOf()来操作原型。',
        severity: 'medium',
      },
      {
        title: '原型上的属性是共享的',
        description: '原型上的属性是所有实例共享的，如果原型上有引用类型的属性（如数组、对象），一个实例修改了，其他实例也会受影响。这也是为什么属性通常在构造函数里定义，方法在原型上定义。',
        severity: 'high',
      },
      {
        title: 'new操作符到底做了什么',
        description: '很多人背了new的四个步骤但理解不深：1) 创建新对象；2) 绑定原型；3) 绑定this并执行构造函数；4) 返回新对象（如果构造函数返回对象则返回那个对象）。每个步骤的原理都要理解。',
        severity: 'high',
      },
    ],
    codeExamples: [
      {
        language: 'javascript',
        code: `// 构造函数和原型
function Person(name, age) {
  this.name = name;  // 实例属性（每个实例一份）
  this.age = age;
}

// 原型方法（所有实例共享，只存一份）
Person.prototype.sayHello = function() {
  console.log("Hello, I'm " + this.name);
};

const person1 = new Person("Alice", 25);
const person2 = new Person("Bob", 30);

person1.sayHello(); // Hello, I'm Alice
person2.sayHello(); // Hello, I'm Bob

// 验证原型关系
console.log(person1.__proto__ === Person.prototype); // true
console.log(Person.prototype.constructor === Person); // true
console.log(person1 instanceof Person); // true

// 原型链
console.log(person1.__proto__.__proto__ === Object.prototype); // true
console.log(person1.__proto__.__proto__.__proto__ === null); // true —— 原型链终点

// 原型上引用类型的坑
function BadExample() {}
BadExample.prototype.list = []; // 原型上的引用类型

const obj1 = new BadExample();
const obj2 = new BadExample();

obj1.list.push(1);
console.log(obj2.list); // [1] —— obj2也被影响了！

// 正确写法：引用类型放构造函数里
function GoodExample() {
  this.list = []; // 每个实例都有自己的数组
}

// 手动实现new操作符
function myNew(constructor, ...args) {
  // 1. 创建新对象，绑定原型
  const obj = Object.create(constructor.prototype);
  // 2. 绑定this并执行构造函数
  const result = constructor.apply(obj, args);
  // 3. 如果构造函数返回对象，就返回那个对象；否则返回新对象
  return typeof result === 'object' && result !== null ? result : obj;
}`,
      },
    ],
    relatedQuestionIds: ['js-1', 'js-4'],
    isHot: true,
  },
  {
    id: 'js-3',
    title: 'JavaScript中的事件循环是什么？',
    categoryId: 'javascript',
    difficulty: 'medium',
    content: '什么是事件循环（Event Loop）？宏任务和微任务有什么区别？执行顺序是怎样的？',
    standardSolution: `**事件循环（Event Loop）**是JavaScript的执行机制，用于协调单线程下的异步代码执行。

**为什么需要事件循环：**
- JavaScript是单线程的
- 但又需要处理异步操作（定时器、网络请求、事件等）
- 事件循环就是为了处理这些异步任务的调度

**宏任务（MacroTask）：**
- setTimeout, setInterval
- setImmediate (Node.js)
- I/O 操作（如网络请求、文件读取）
- UI渲染（浏览器）
- script 标签中的代码

**微任务（MicroTask）：**
- Promise.then/catch/finally
- async/await（本质上是Promise）
- MutationObserver（浏览器）
- process.nextTick（Node.js，比其他微任务更早）

**执行顺序：**
1. 执行同步代码（属于宏任务）
2. 执行完所有微任务
3. 执行下一个宏任务
4. 再执行所有微任务
5. 如此循环...`,
    pitfalls: [
      {
        title: 'Promise构造函数是同步执行的',
        description: '很多人以为Promise都是异步的，实际上Promise构造函数里的代码是同步执行的，只有.then/.catch的回调才是微任务。这是很容易搞错的细节，面试经常考。',
        severity: 'high',
      },
      {
        title: 'async函数中await后面的代码是微任务',
        description: 'async函数中，await之前的代码是同步执行的，await后面的代码相当于Promise.then里的回调，是微任务。理解这一点对于分析复杂的执行顺序题很重要。',
        severity: 'high',
      },
      {
        title: 'UI渲染时机在微任务之后',
        description: '在浏览器中，每一轮事件循环的大致顺序是：宏任务 → 微任务 → 浏览器渲染。所以如果想在下次渲染前做DOM操作，应该用微任务（如Promise.then）。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'javascript',
        code: `// 经典面试题：执行顺序
console.log('1');  // 同步

setTimeout(() => {
  console.log('2');  // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3');  // 微任务
});

console.log('4');  // 同步

// 输出顺序：1 4 3 2
// 解释：先执行同步代码，再执行微任务，最后执行宏任务

// 更复杂的例子
console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});

async function async1() {
  console.log('async1 start');
  await async2();  // await前面同步，后面微任务
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

async1();

console.log('script end');

// 输出顺序：
// script start
// async1 start
// async2
// script end
// promise1
// async1 end
// promise2
// setTimeout

// 解释：
// 1. 同步代码：script start → async1 start → async2 → script end
// 2. 微任务：promise1 → async1 end → promise2
// 3. 宏任务：setTimeout

// Node.js中还有process.nextTick，优先级比其他微任务高
// process.nextTick 回调会在所有微任务之前执行`,
      },
    ],
    relatedQuestionIds: ['js-1', 'js-5'],
    isHot: true,
  },
  {
    id: 'js-4',
    title: 'JavaScript中的this指向问题？',
    categoryId: 'javascript',
    difficulty: 'medium',
    content: 'JavaScript中this的指向有哪些规则？如何改变this指向？箭头函数的this有什么特别？',
    standardSolution: `**this的指向规则（优先级从高到低）：**

1. **new绑定**：用new调用构造函数时，this指向新创建的对象
2. **显式绑定**：用call、apply、bind调用时，this指向指定的对象
3. **隐式绑定**：作为对象的方法调用时，this指向那个对象
4. **默认绑定**：其他情况，this指向全局对象（严格模式下是undefined）

**改变this指向的方法：**
- call：立即执行，参数列表形式传递
- apply：立即执行，数组形式传递参数
- bind：返回新函数，不立即执行
- 箭头函数：不绑定自己的this，继承外层作用域的this

**箭头函数的this：**
- 箭头函数没有自己的this
- 箭头函数的this是定义时所在作用域的this
- 箭头函数的this不能通过call、apply、bind改变
- 箭头函数不能作为构造函数，不能用new调用`,
    pitfalls: [
      {
        title: '隐式绑定丢失',
        description: '把对象的方法赋值给另一个变量再调用，或者作为回调函数传递，this就会丢失，变成默认绑定。这是很常见的坑，比如事件处理函数、定时器回调等。',
        severity: 'high',
      },
      {
        title: 'call/apply/bind对箭头函数无效',
        description: '箭头函数的this是在定义时就确定的，是外层作用域的this。用call、apply、bind都改变不了箭头函数的this。如果发现this不对，先看看是不是用了箭头函数。',
        severity: 'high',
      },
      {
        title: '严格模式下的默认绑定不同',
        description: '非严格模式下，默认绑定this指向全局对象（浏览器是window，Node是global）。但严格模式下，默认绑定this是undefined。所以"use strict"下直接调用函数，this是undefined。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'javascript',
        code: `// 1. 默认绑定
function defaultFunc() {
  console.log(this);
}
defaultFunc(); // 非严格模式：window / global；严格模式：undefined

// 2. 隐式绑定
const obj = {
  name: 'Alice',
  sayName: function() {
    console.log(this.name);
  }
};
obj.sayName(); // Alice —— this指向obj

// 隐式绑定丢失
const func = obj.sayName;
func(); // undefined —— this变成了全局对象

// 3. 显式绑定
function greet(greeting) {
  console.log(greeting + ', ' + this.name);
}

const person = { name: 'Bob' };
greet.call(person, 'Hello');   // Hello, Bob
greet.apply(person, ['Hi']);   // Hi, Bob

const boundGreet = greet.bind(person);
boundGreet('Hey');             // Hey, Bob

// 4. new绑定
function Person(name) {
  this.name = name;
}
const alice = new Person('Alice');
console.log(alice.name); // Alice

// 5. 箭头函数
const arrowObj = {
  name: 'Charlie',
  sayName: () => {
    console.log(this.name); // 箭头函数的this是外层作用域的this
  }
};
arrowObj.sayName(); // undefined —— this不是arrowObj

// 箭头函数的this不能被改变
const anotherObj = { name: 'Dave' };
arrowObj.sayName.call(anotherObj); // 还是undefined —— call无效

// 箭头函数适合的场景：回调函数
const callbackExample = {
  name: 'Eve',
  delayedGreet: function() {
    // 不好：普通函数的this会丢失
    // setTimeout(function() { console.log(this.name); }, 100);
    
    // 好：箭头函数继承外层this
    setTimeout(() => {
      console.log(this.name); // Eve
    }, 100);
  }
};
callbackExample.delayedGreet();`,
      },
    ],
    relatedQuestionIds: ['js-2', 'js-5'],
    isHot: true,
  },
  {
    id: 'js-5',
    title: 'JavaScript中的Promise是什么？',
    categoryId: 'javascript',
    difficulty: 'medium',
    content: '什么是Promise？Promise有几种状态？Promise的链式调用和常见方法有哪些？',
    standardSolution: `**Promise**是异步编程的一种解决方案，比传统的回调函数更强大、更优雅。

**三种状态：**
1. **pending（进行中）**：初始状态
2. **fulfilled（已成功）**：操作成功完成
3. **rejected（已失败）**：操作失败

**状态特点：**
- 状态只能从pending变为fulfilled或rejected
- 状态一旦改变，就不会再变
- 状态改变后再添加回调，也会立即得到结果

**Promise的优点：**
- 解决回调地狱（Callback Hell）
- 链式调用，更易读
- 统一的错误处理
- 可以组合使用（Promise.all等）

**常用方法：**
- Promise.then()：成功回调
- Promise.catch()：失败回调
- Promise.finally()：无论成功失败都执行
- Promise.all()：所有都成功才成功，一个失败就失败
- Promise.race()：谁先完成谁先返回
- Promise.allSettled()：等所有都完成
- Promise.any()：一个成功就成功，都失败才失败
- Promise.resolve()：返回成功的Promise
- Promise.reject()：返回失败的Promise`,
    pitfalls: [
      {
        title: 'Promise不是完全异步的',
        description: '很多人以为Promise是纯异步的，实际上Promise构造函数里的代码是同步执行的，只有.then/.catch的回调才是微任务。这是面试常考的细节点。',
        severity: 'high',
      },
      {
        title: 'Promise的值穿透',
        description: '.then()或.catch()的参数如果不是函数，会发生值穿透——也就是上一个Promise的结果直接传给下一个then。比如.then(console.log(1)) 会立即执行console.log，而不是等Promise完成。',
        severity: 'medium',
      },
      {
        title: 'catch和then的第二个参数有区别',
        description: '.then(onFulfilled, onRejected) 和 .then(onFulfilled).catch(onRejected) 不完全一样。前者的onRejected只能捕获前面Promise的错误，不能捕获onFulfilled里的错误；而.catch能捕获它前面所有的错误。',
        severity: 'medium',
      },
    ],
    codeExamples: [
      {
        language: 'javascript',
        code: `// Promise基本用法
function fetchData(url) {
  return new Promise((resolve, reject) => {
    // 模拟异步请求
    setTimeout(() => {
      if (url) {
        resolve({ data: 'some data from ' + url });
      } else {
        reject(new Error('url is required'));
      }
    }, 1000);
  });
}

fetchData('/api/user')
  .then(result => {
    console.log('成功:', result);
    return result.data;
  })
  .then(data => {
    console.log('数据:', data);
  })
  .catch(error => {
    console.error('失败:', error);
  })
  .finally(() => {
    console.log('总是会执行');
  });

// Promise.all：等所有都成功
Promise.all([
  fetchData('/api/user'),
  fetchData('/api/posts'),
  fetchData('/api/comments')
]).then(results => {
  console.log('所有都成功了', results);
}).catch(error => {
  console.log('有一个失败了', error);
});

// Promise.race：谁快谁先返回
Promise.race([
  fetchData('/api/fast'),
  fetchData('/api/slow')
]).then(result => {
  console.log('最快的那个结果', result);
});

// async/await（Promise的语法糖）
async function getData() {
  try {
    const result = await fetchData('/api/user');
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

// 值穿透的例子
Promise.resolve(1)
  .then(2)        // 不是函数，值穿透
  .then(Promise.resolve(3)) // 不是函数，值穿透
  .then(console.log); // 输出1

// 推荐：总是用.catch而不是then的第二个参数
// 不好：onRejected捕获不到onFulfilled里的错误
// promise.then(
//   () => { throw new Error('oops'); },
//   err => console.log(err) // 捕获不到上面的错误
// );

// 好：catch能捕获前面所有错误
promise
  .then(() => { throw new Error('oops'); })
  .catch(err => console.log(err)); // 能捕获到`,
      },
    ],
    relatedQuestionIds: ['js-3', 'js-4'],
    isHot: false,
  },
];


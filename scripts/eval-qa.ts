import 'dotenv/config';
import { readFile } from 'fs/promises';
import path from 'path';
import { desc, eq } from 'drizzle-orm';
import { db } from '../lib/db';
import { imports } from '../lib/db/schema';
import { buildRelationshipQAContext } from '../lib/qa/retrieve';
import { answerRelationshipQuestion } from '../lib/qa/analyze';

type EvalQuestion = {
  name: string;
  question: string;
};

async function main() {
  // 1. 找最近一次已解析完成的导入记录
  const latestImportRows = await db
    .select()
    .from(imports)
    .where(eq(imports.status, 'parsed'))
    .orderBy(desc(imports.createdAt))
    .limit(1);

  if (latestImportRows.length === 0) {
    throw new Error('没有找到可用于评测的导入记录。');
  }

  const currentImport = latestImportRows[0];
  const relationId = currentImport.relationId;

  // 2. 读取固定问题集
  const filePath = path.join(process.cwd(), 'data', 'qa-eval-questions.json');
  const fileContent = await readFile(filePath, 'utf-8');
  const questions = JSON.parse(fileContent) as EvalQuestion[];

  console.log('='.repeat(80));
  console.log('关系问答最小评测开始');
  console.log(`relationId: ${relationId}`);
  console.log(`问题数量: ${questions.length}`);
  console.log('='.repeat(80));

  // 3. 串行执行评测
  for (let i = 0; i < questions.length; i++) {
    const item = questions[i];

    console.log(`\n[${i + 1}/${questions.length}] ${item.name}`);
    console.log(`问题: ${item.question}`);
    console.log('-'.repeat(80));

    try {
      const context = await buildRelationshipQAContext({
        relationId,
        question: item.question,
      });

      const answer = await answerRelationshipQuestion(context);

      console.log('回答:');
      console.log(answer.answer);

      console.log('\n关键点:');
      if (answer.keyPoints.length > 0) {
        answer.keyPoints.forEach((point, idx) => {
          console.log(`  ${idx + 1}. ${point}`);
        });
      } else {
        console.log('  （无）');
      }

      console.log('\n引用的 sessionIds:');
      console.log(
        answer.referencedSessionIds.length > 0
          ? `  ${answer.referencedSessionIds.join(', ')}`
          : '  （无）'
      );

      console.log('\n引用的 memoryCardIds:');
      console.log(
        answer.referencedMemoryCardIds.length > 0
          ? `  ${answer.referencedMemoryCardIds.join(', ')}`
          : '  （无）'
      );
    } catch (error) {
      console.log('评测失败:');
      console.log(error instanceof Error ? error.message : '未知错误');
    }

    console.log('\n' + '='.repeat(80));
  }

  console.log('关系问答最小评测结束');
}

main().catch((error) => {
  console.error('评测脚本运行失败:', error);
  process.exit(1);
});
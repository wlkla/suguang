const fetch = require('node-fetch');

async function testAIAnalysis() {
  try {
    console.log('🧪 Testing AI Analysis API...');
    
    // 首先注册一个测试用户
    const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'test_user_' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'test123456'
      })
    });

    if (!registerResponse.ok) {
      throw new Error(`Register failed: ${registerResponse.status}`);
    }

    const registerData = await registerResponse.json();
    const token = registerData.token;
    console.log('✅ User registered successfully');

    // 创建一个记忆记录
    const memoryResponse = await fetch('http://localhost:3001/api/memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: '测试记忆',
        content: '今天我感到有些困惑，对未来的方向不太确定。我在思考自己的职业发展，想要找到更有意义的工作。',
        mood: 3,
        tags: '困惑,思考,职业'
      })
    });

    if (!memoryResponse.ok) {
      throw new Error(`Memory creation failed: ${memoryResponse.status}`);
    }

    const memoryData = await memoryResponse.json();
    const memoryId = memoryData.record.id;
    console.log('✅ Memory record created');

    // 生成时间线分析
    const analysisResponse = await fetch('http://localhost:3001/api/timeline/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        memoryRecordId: memoryId,
        stage: 'initial',
        conversationData: [
          { sender: 'user', text: '现在的我想和过去的我聊聊' },
          { sender: 'past-self', text: '那时候我确实很困惑' }
        ]
      })
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      throw new Error(`Analysis failed: ${analysisResponse.status} - ${errorText}`);
    }

    const analysisData = await analysisResponse.json();
    console.log('✅ Analysis generated successfully');
    console.log('📊 Analysis result:', {
      insight: analysisData.analysis.insight.substring(0, 100) + '...',
      emotionalState: analysisData.analysis.emotionalState,
      growthIndicators: analysisData.analysis.growthIndicators
    });

    // 检查是否是AI生成的内容（而不是固定的fallback内容）
    const isAIGenerated = !analysisData.analysis.insight.includes('从这段记录中，可以看出你正在思考重要的人生议题');
    
    if (isAIGenerated) {
      console.log('🎉 SUCCESS: AI analysis is working correctly!');
      console.log('✅ Generated personalized analysis instead of fallback content');
    } else {
      console.log('⚠️ WARNING: Still using fallback content');
      console.log('📝 Full insight:', analysisData.analysis.insight);
    }

    return { success: true, isAIGenerated };

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// 运行测试
testAIAnalysis()
  .then(result => {
    console.log('\n🏁 Test completed:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('🔥 Unexpected error:', error);
    process.exit(1);
  });
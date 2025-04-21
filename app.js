let surveyResult = null;

function calculateBMR(weight, height, age, gender) {
    if (gender === "male") {
        return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
}

function calculateStandardWeight(height, gender) {
    const heightInInches = height / 2.54;
    if (gender === "male") {
        return 48 + 2.7 * (heightInInches - 60);
    } else {
        return 45.5 + 2.2 * (heightInInches - 60);
    }
}

function submitSurvey() {
    console.log("Submit survey button clicked!");

    // 获取 DOM 元素
    const q1Element = document.getElementById("q1");
    const q2Element = document.getElementById("q2");
    const q3Element = document.getElementById("q3");
    const q4Element = document.getElementById("q4");
    const surveyModal = document.getElementById("surveyModal");

    // 检查 DOM 元素是否存在
    if (!q1Element || !q2Element || !q3Element || !q4Element || !surveyModal) {
        console.error("Survey DOM elements not found");
        return;
    }

    // 获取输入值并解析
    const q1 = parseInt(q1Element.value) || 0;
    const q2 = parseInt(q2Element.value) || 0;
    const q3 = parseInt(q3Element.value) || 0;
    const q4 = parseInt(q4Element.value) || 0;

    console.log("Survey inputs:", { q1, q2, q3, q4 });

    // 验证输入
    if (q2 < 1 || q2 > 5 || q3 < 1 || q3 > 5) {
        alert("请正确填写疲劳程度和睡眠质量（1-5 分）！");
        return;
    }

    // 计算风险分数
    const riskScore = q1 * 2 + q2 - q3 + (2 - q4);
    let riskLevel, riskAdvice;
    if (riskScore <= 2) {
        riskLevel = "低";
        riskAdvice = "你的运动风险较低，但仍需注意热身和拉伸，避免突然增加运动强度。";
    } else if (riskScore <= 5) {
        riskLevel = "中";
        riskAdvice = "你的运动风险中等，建议减少高强度运动频率，增加恢复时间，关注伤病部位的保护。";
    } else {
        riskLevel = "高";
        riskAdvice = "你的运动风险较高，建议咨询专业教练或医生，优先选择低强度运动，并确保充分热身和恢复。";
    }

    surveyResult = { riskLevel, riskAdvice };
    console.log("Survey result:", surveyResult);

    // 隐藏弹窗
    surveyModal.classList.add("hidden");
}

function calculate() {
    console.log("Calculate button clicked!");

    // 显示加载动画
    const loadingElement = document.getElementById("loading");
    const resultElement = document.getElementById("result");
    if (!loadingElement || !resultElement) {
        console.error("DOM elements not found: loading or result");
        return;
    }

    loadingElement.classList.remove("hidden");
    resultElement.classList.add("hidden");

    setTimeout(() => {
        // 获取输入
        const age = parseInt(document.getElementById("age").value);
        const gender = document.getElementById("gender").value;
        const height = parseFloat(document.getElementById("height").value);
        const weight = parseFloat(document.getElementById("weight").value);
        const exerciseFreq = parseInt(document.getElementById("exerciseFreq").value);
        const goal = document.getElementById("goal").value;

        console.log("Inputs:", { age, gender, height, weight, exerciseFreq, goal });

        // 验证输入
        if (!age || !height || !weight || !exerciseFreq) {
            alert("请填写所有必填字段！");
            loadingElement.classList.add("hidden");
            return;
        }

        // 计算 BMR 和 TDEE
        const bmr = calculateBMR(weight, height, age, gender);
        const activityLevel = exerciseFreq <= 2 ? 1.2 : exerciseFreq <= 4 ? 1.55 : 1.9;
        let tdee = bmr * activityLevel;

        // 根据目标调整热量
        let targetCalories = tdee;
        if (goal === "fatLoss") targetCalories -= 500;
        else if (goal === "muscleGain") targetCalories += 400;

        // 计算标准体重
        const standardWeight = calculateStandardWeight(height, gender);
        const weightDiff = (weight - standardWeight).toFixed(1);

        // 计算 BMI
        const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

        // 生成训练计划（根据风险水平调整）
        let trainingPlan = "";
        let scheduleData = [];
        const riskLevel = surveyResult ? surveyResult.riskLevel : "中";
        if (riskLevel === "高") {
            trainingPlan = "周一：快走 30分钟（心率 100-110）\n周三：瑜伽 20分钟\n周五：轻量拉伸 15分钟";
            scheduleData = [
                ["周一", "快走 30分钟"],
                ["周三", "瑜伽 20分钟"],
                ["周五", "轻量拉伸 15分钟"]
            ];
        } else if (goal === "fatLoss") {
            trainingPlan = "周一：HIIT 30分钟（心率 120-140）\n周三：慢跑 5公里\n周五：全身力量训练 30分钟";
            scheduleData = [
                ["周一", "HIIT 30分钟"],
                ["周三", "慢跑 5公里"],
                ["周五", "全身力量训练 30分钟"]
            ];
        } else if (goal === "muscleGain") {
            trainingPlan = "周一：胸肌训练（哑铃卧推 3组x12次）\n周三：腿部训练（深蹲 3组x10次）\n周五：背部训练（引体向上 3组x8次）";
            scheduleData = [
                ["周一", "胸肌训练"],
                ["周三", "腿部训练"],
                ["周五", "背部训练"]
            ];
        } else {
            trainingPlan = "周一：慢跑 5公里（心率 110-130）\n周三：游泳 40分钟\n周五：骑行 1小时";
            scheduleData = [
                ["周一", "慢跑 5公里"],
                ["周三", "游泳 40分钟"],
                ["周五", "骑行 1小时"]
            ];
        }

        // 生成饮食建议
        let nutritionRatio = goal === "fatLoss" ? [30, 40, 30] : goal === "muscleGain" ? [35, 45, 20] : [25, 50, 25];
        const dietPlan = goal === "fatLoss" ?
            "早餐：燕麦 50g + 鸡蛋 2个\n午餐：鸡胸肉 100g + 糙米 100g\n晚餐：三文鱼 100g + 红薯 100g" :
            goal === "muscleGain" ?
            "早餐：燕麦 70g + 蛋白粉 30g\n午餐：牛肉 150g + 糙米 150g\n晚餐：鸡胸肉 120g + 蔬菜 200g" :
            "早餐：全麦面包 2片 + 鸡蛋 2个\n午餐：鸡胸肉 100g + 糙米 100g\n晚餐：鲈鱼 100g + 蔬菜 200g";

        // 文本输出
        const bodyOutput = document.getElementById("bodyOutput");
        const riskOutput = document.getElementById("riskOutput");
        const trainingOutput = document.getElementById("trainingOutput");
        const dietOutput = document.getElementById("dietOutput");

        if (!bodyOutput || !riskOutput || !trainingOutput || !dietOutput) {
            console.error("DOM elements for output not found");
            loadingElement.classList.add("hidden");
            return;
        }

        bodyOutput.innerText = `
- BMI：${bmi}（正常范围：18.5-24.9）
- 当前体重 ${weight} kg，与标准体重 ${standardWeight.toFixed(1)} kg 相差 ${weightDiff} kg
        `;
        riskOutput.innerText = surveyResult ? `
- 风险等级：${surveyResult.riskLevel}
- 建议：${surveyResult.riskAdvice}
        ` : `
- 风险等级：未评估（请完成问卷）
- 建议：请先完成运动风险问卷以获得个性化建议。
        `;
        trainingOutput.innerText = trainingPlan;
        dietOutput.innerText = `
- 每日热量需求：${Math.round(targetCalories)} kcal
- 营养比例：蛋白质 ${nutritionRatio[0]}%，碳水化合物 ${nutritionRatio[1]}%，脂肪 ${nutritionRatio[2]}%
${dietPlan}
        `;

        // 隐藏加载动画，显示结果
        loadingElement.classList.add("hidden");
        resultElement.classList.remove("hidden");

        // 体重对比图表
        const weightChartElement = document.getElementById("weightChart");
        if (weightChartElement) {
            const weightChart = echarts.init(weightChartElement, null, { renderer: 'svg' });
            weightChart.setOption({
                xAxis: { type: "category", data: ["当前体重", "标准体重"], axisLabel: { color: "#6B7280" } },
                yAxis: { type: "value", axisLabel: { color: "#6B7280" } },
                series: [{
                    type: "bar",
                    data: [weight, standardWeight],
                    itemStyle: { color: "#38BDF8" },
                    animationDuration: 1000
                }],
                backgroundColor: "transparent"
            });
        } else {
            console.error("Weight chart element not found");
        }

        // 训练计划图表
        const scheduleChartElement = document.getElementById("scheduleChart");
        if (scheduleChartElement) {
            const scheduleChart = echarts.init(scheduleChartElement, null, { renderer: 'svg' });
            scheduleChart.setOption({
                xAxis: { type: "category", data: scheduleData.map(item => item[0]), axisLabel: { color: "#6B7280" } },
                yAxis: { type: "value", show: false },
                series: [{
                    type: "bar",
                    data: scheduleData.map(() => 1),
                    label: { show: true, position: "top", formatter: params => scheduleData[params.dataIndex][1], color: "#6B7280" },
                    itemStyle: { color: "#34D399" },
                    animationDuration: 1000
                }],
                backgroundColor: "transparent"
            });
        } else {
            console.error("Schedule chart element not found");
        }

        // 营养比例图表
        const nutritionChartElement = document.getElementById("nutritionChart");
        if (nutritionChartElement) {
            const nutritionChart = echarts.init(nutritionChartElement, null, { renderer: 'svg' });
            nutritionChart.setOption({
                series: [{
                    type: "pie",
                    data: [
                        { value: nutritionRatio[0], name: "蛋白质", itemStyle: { color: "#38BDF8" } },
                        { value: nutritionRatio[1], name: "碳水化合物", itemStyle: { color: "#34D399" } },
                        { value: nutritionRatio[2], name: "脂肪", itemStyle: { color: "#A78BFA" } }
                    ],
                    label: { show: true, formatter: "{b}: {d}%", color: "#6B7280" },
                    animationDuration: 1000
                }],
                backgroundColor: "transparent"
            });
        } else {
            console.error("Nutrition chart element not found");
        }
    }, 1000); // 模拟加载延迟
}
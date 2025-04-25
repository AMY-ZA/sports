let surveyResult = JSON.parse(localStorage.getItem("surveyResult")) || null;
let healthRecords = JSON.parse(localStorage.getItem("healthRecords")) || [];

// 重置应用
function resetApp() {
    localStorage.removeItem("surveyResult");
    localStorage.removeItem("healthRecords");
    surveyResult = null;
    healthRecords = [];
    location.reload();
}

// 页面切换
function showPage(pageId) {
    const pages = ["profilePage", "assessmentPage", "knowledgePage", "recordsPage"];
    pages.forEach(id => {
        const page = document.getElementById(id);
        if (page) page.classList.add("hidden");
    });
    const targetPage = document.getElementById(pageId + "Page");
    if (targetPage) targetPage.classList.remove("hidden");
    if (pageId === "records") updateHealthRecords();
    document.getElementById("sidebar").classList.remove("sidebar-open");
}

// 实时输入验证
function validateInput(element) {
    const errorElement = document.getElementById(`${element.id}-error`);
    const value = element.id === "profileBloodPressure" ? element.value : parseFloat(element.value);
    let errorMessage = "";

    if (element.id === "age" || element.id === "profileAge") {
        if (isNaN(value) || value < 10 || value > 100) errorMessage = "年龄应在 10-100 岁之间";
    } else if (element.id === "height" || element.id === "profileHeight") {
        if (isNaN(value) || value < 100 || value > 250) errorMessage = "身高应在 100-250 厘米之间";
    } else if (element.id === "weight" || element.id === "profileWeight") {
        if (isNaN(value) || value < 30 || value > 200) errorMessage = "体重应在 30-200 公斤之间";
    } else if (element.id === "exerciseFreq" || element.id === "profileExerciseFreq") {
        if (isNaN(value) || value < 0 || value > 7) errorMessage = "每周运动频率应在 0-7 次之间";
    } else if (element.id === "sedentaryHours") {
        if (isNaN(value) || value < 0 || value > 24) errorMessage = "久坐时间应在 0-24 小时之间";
    } else if (element.id === "q2" || element.id === "q3") {
        if (isNaN(value) || value < 1 || value > 5) errorMessage = "请输入 1-5 之间的数字";
    } else if (element.id === "profileHeartRate") {
        if (isNaN(value) || value < 30 || value > 200) errorMessage = "心率应在 30-200 次/分钟之间";
    } else if (element.id === "profileBloodPressure") {
        const regex = /^\d{2,3}\/\d{2,3}$/;
        if (!regex.test(value)) errorMessage = "请输入有效的血压值，例如：120/80";
    }

    if (errorMessage) {
        element.classList.add("invalid");
        errorElement.textContent = errorMessage;
        errorElement.classList.remove("hidden");
    } else {
        element.classList.remove("invalid");
        errorElement.textContent = "";
        errorElement.classList.add("hidden");
    }
}

// 保存个人信息
function saveProfile() {
    const age = parseInt(document.getElementById("profileAge").value);
    const gender = document.getElementById("profileGender").value;
    const height = parseFloat(document.getElementById("profileHeight").value);
    const weight = parseFloat(document.getElementById("profileWeight").value);
    const exerciseFreq = parseInt(document.getElementById("profileExerciseFreq").value);
    const goal = document.getElementById("profileGoal").value;
    const heartRate = parseFloat(document.getElementById("profileHeartRate").value);
    const bloodPressure = document.getElementById("profileBloodPressure").value;

    if (!age || !gender || !height || !weight || isNaN(exerciseFreq) || !goal) {
        alert("请填写所有必填字段！");
        return;
    }
    if (age < 10 || age > 100) {
        alert("年龄应在 10-100 岁之间！");
        return;
    }
    if (height < 100 || height > 250) {
        alert("身高应在 100-250 厘米之间！");
        return;
    }
    if (weight < 30 || weight > 200) {
        alert("体重应在 30-200 公斤之间！");
        return;
    }
    if (exerciseFreq < 0 || exerciseFreq > 7) {
        alert("每周运动频率应在 0-7 次之间！");
        return;
    }
    if (heartRate && (heartRate < 30 || heartRate > 200)) {
        alert("心率应在 30-200 次/分钟之间！");
        return;
    }
    if (bloodPressure && !/^\d{2,3}\/\d{2,3}$/.test(bloodPressure)) {
        alert("请输入有效的血压值，例如：120/80！");
        return;
    }

    const record = {
        timestamp: new Date().toLocaleString(),
        age,
        gender,
        height,
        weight,
        exerciseFreq,
        goal,
        heartRate: heartRate || null,
        bloodPressure: bloodPressure || null
    };

    healthRecords.push(record);
    localStorage.setItem("healthRecords", JSON.stringify(healthRecords));
    alert("信息保存成功！");
    updateHealthRecords();
    showPage("records");
}

// 更新健康档案
function updateHealthRecords() {
    const recordsDiv = document.getElementById("healthRecords");
    if (!recordsDiv) return;

    recordsDiv.innerHTML = healthRecords.length === 0
        ? "<p class='text-gray-600'>暂无健康档案，请先上传身份信息。</p>"
        : healthRecords.map((record, index) => `
            <div class="card bg-white p-6 rounded-lg shadow-sm">
                <h3 class="text-lg font-medium mb-2 text-gray-700">记录 ${index + 1} - ${record.timestamp}</h3>
                <p>年龄：${record.age} 岁</p>
                <p>性别：${record.gender === "male" ? "男" : "女"}</p>
                <p>身高：${record.height} cm</p>
                <p>体重：${record.weight} kg</p>
                <p>每周运动频率：${record.exerciseFreq} 次</p>
                <p>目标：${record.goal === "fatLoss" ? "减脂" : record.goal === "muscleGain" ? "增肌" : "提高耐力"}</p>
                ${record.heartRate ? `<p>心率：${record.heartRate} 次/分钟</p>` : ""}
                ${record.bloodPressure ? `<p>血压：${record.bloodPressure} mmHg</p>` : ""}
            </div>
        `).join("");

    // 绘制趋势图
    if (typeof echarts !== "undefined") {
        const heartRateData = healthRecords.filter(r => r.heartRate).map(r => ({ date: r.timestamp, value: r.heartRate }));
        const bloodPressureData = healthRecords.filter(r => r.bloodPressure).map(r => ({
            date: r.timestamp,
            systolic: parseInt(r.bloodPressure.split("/")[0]),
            diastolic: parseInt(r.bloodPressure.split("/")[1])
        }));

        const heartRateChart = echarts.init(document.getElementById("heartRateChart"), null, { renderer: 'svg' });
        heartRateChart.setOption({
            xAxis: { type: "category", data: heartRateData.map(d => d.date), axisLabel: { color: "#6B7280" } },
            yAxis: { type: "value", axisLabel: { color: "#6B7280" } },
            series: [{
                type: "line",
                data: heartRateData.map(d => d.value),
                itemStyle: { color: "#38BDF8" },
                animationDuration: 1000
            }],
            backgroundColor: "transparent"
        });

        const bloodPressureChart = echarts.init(document.getElementById("bloodPressureChart"), null, { renderer: 'svg' });
        bloodPressureChart.setOption({
            xAxis: { type: "category", data: bloodPressureData.map(d => d.date), axisLabel: { color: "#6B7280" } },
            yAxis: { type: "value", axisLabel: { color: "#6B7280" } },
            series: [
                { type: "line", name: "收缩压", data: bloodPressureData.map(d => d.systolic), itemStyle: { color: "#F97316" } },
                { type: "line", name: "舒张压", data: bloodPressureData.map(d => d.diastolic), itemStyle: { color: "#34D399" } }
            ],
            legend: { bottom: 0 },
            backgroundColor: "transparent"
        });
    }
}

// 提交问卷
function submitSurvey() {
    console.log("提交问卷按钮点击！");

    const q1Element = document.getElementById("q1");
    const q2Element = document.getElementById("q2");
    const q3Element = document.getElementById("q3");
    const q4Element = document.getElementById("q4");
    const surveyModal = document.getElementById("surveyModal");

    if (!q1Element || !q2Element || !q3Element || !q4Element || !surveyModal) {
        alert("问卷元素加载失败，请刷新页面重试！");
        return;
    }

    const q1 = parseInt(q1Element.value) || 0;
    const q2 = parseInt(q2Element.value);
    const q3 = parseInt(q3Element.value);
    const q4 = parseInt(q4Element.value) || 0;

    if (isNaN(q2) || isNaN(q3) || q2 < 1 || q2 > 5 || q3 < 1 || q3 > 5) {
        alert("请正确填写疲劳程度和睡眠质量（1-5 分）！");
        return;
    }

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

    surveyResult = { riskLevel, riskAdvice, sleepQuality: q3 };
    localStorage.setItem("surveyResult", JSON.stringify(surveyResult));
    console.log("问卷结果：", surveyResult);

    surveyModal.classList.add("hidden");
    showPage("assessment"); // 提交后显示健康评估页面
}

// 复制报告
function copyReport() {
    const bodyOutput = document.getElementById("bodyOutput").innerText;
    const energyOutput = document.getElementById("energyOutput").innerText;
    const lifestyleOutput = document.getElementById("lifestyleOutput").innerText;
    const riskOutput = document.getElementById("riskOutput").innerText;
    const trainingOutput = document.getElementById("trainingOutput").innerText;
    const dietOutput = document.getElementById("dietOutput").innerText;

    const reportText = `运动健康评估报告\n\n` +
                      `=== 身体状态 ===\n${bodyOutput}\n\n` +
                      `=== 基础能量消耗 ===\n${energyOutput}\n\n` +
                      `=== 生活习惯分析 ===\n${lifestyleOutput}\n\n` +
                      `=== 运动风险分析 ===\n${riskOutput}\n\n` +
                      `=== 训练计划 ===\n${trainingOutput}\n\n` +
                      `=== 饮食建议 ===\n${dietOutput}`;

    navigator.clipboard.writeText(reportText).then(() => {
        const feedback = document.getElementById("copyFeedback");
        feedback.classList.remove("opacity-0");
        setTimeout(() => feedback.classList.add("opacity-0"), 2000);
    }).catch(() => {
        alert("复制失败，请手动复制报告内容！");
    });
}

// 导出 PDF
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(12);

    let yOffset = 10;
    const lineHeight = 10;
    const maxWidth = 180;

    doc.text("运动健康评估报告", 10, yOffset);
    yOffset += lineHeight;

    const bodyOutput = document.getElementById("bodyOutput").innerText;
    const energyOutput = document.getElementById("energyOutput").innerText;
    const lifestyleOutput = document.getElementById("lifestyleOutput").innerText;
    const riskOutput = document.getElementById("riskOutput").innerText;
    const trainingOutput = document.getElementById("trainingOutput").innerText;
    const dietOutput = document.getElementById("dietOutput").innerText;

    const sections = [
        { title: "身体状态", content: bodyOutput },
        { title: "基础能量消耗", content: energyOutput },
        { title: "生活习惯分析", content: lifestyleOutput },
        { title: "运动风险分析", content: riskOutput },
        { title: "训练计划", content: trainingOutput },
        { title: "饮食建议", content: dietOutput }
    ];

    if (healthRecords.length > 0) {
        const latestRecord = healthRecords[healthRecords.length - 1];
        sections.push({
            title: "最新健康档案",
            content: `时间：${latestRecord.timestamp}\n` +
                     `年龄：${latestRecord.age} 岁\n` +
                     `性别：${latestRecord.gender === "male" ? "男" : "女"}\n` +
                     `身高：${latestRecord.height} cm\n` +
                     `体重：${latestRecord.weight} kg\n` +
                     `每周运动频率：${latestRecord.exerciseFreq} 次\n` +
                     `目标：${latestRecord.goal === "fatLoss" ? "减脂" : latestRecord.goal === "muscleGain" ? "增肌" : "提高耐力"}\n` +
                     (latestRecord.heartRate ? `心率：${latestRecord.heartRate} 次/分钟\n` : "") +
                     (latestRecord.bloodPressure ? `血压：${latestRecord.bloodPressure} mmHg` : "")
        });
    }

    sections.forEach(section => {
        doc.text(`=== ${section.title} ===`, 10, yOffset);
        yOffset += lineHeight;
        const lines = doc.splitTextToSize(section.content, maxWidth);
        lines.forEach(line => {
            if (yOffset > 270) {
                doc.addPage();
                yOffset = 10;
            }
            doc.text(line, 10, yOffset);
            yOffset += lineHeight;
        });
        yOffset += lineHeight;
    });

    doc.save("健康评估报告.pdf");
}

// 计算基础代谢率
function calculateBMR(weight, height, age, gender) {
    if (gender === "male") {
        return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
}

// 计算标准体重
function calculateStandardWeight(height, gender) {
    const heightInInches = height / 2.54;
    if (gender === "male") {
        return 48 + 2.7 * (heightInInches - 60);
    } else {
        return 45.5 + 2.2 * (heightInInches - 60);
    }
}

// 主计算函数
function calculate() {
    console.log("计算按钮点击！");

    const loadingElement = document.getElementById("loading");
    const resultElement = document.getElementById("result");
    if (!loadingElement || !resultElement) {
        alert("页面元素加载失败，请刷新页面重试！");
        return;
    }

    loadingElement.classList.remove("hidden");
    resultElement.classList.add("hidden");

    setTimeout(() => {
        const age = parseInt(document.getElementById("age").value);
        const gender = document.getElementById("gender").value;
        const height = parseFloat(document.getElementById("height").value);
        const weight = parseFloat(document.getElementById("weight").value);
        const exerciseFreq = parseInt(document.getElementById("exerciseFreq").value);
        const sedentaryHours = parseFloat(document.getElementById("sedentaryHours").value);
        const goal = document.getElementById("goal").value;

        if (!age || !height || !weight || isNaN(exerciseFreq) || isNaN(sedentaryHours)) {
            alert("请填写所有必填字段！");
            loadingElement.classList.add("hidden");
            return;
        }
        if (age < 10 || age > 100) {
            alert("年龄应在 10-100 岁之间！");
            loadingElement.classList.add("hidden");
            return;
        }
        if (height < 100 || height > 250) {
            alert("身高应在 100-250 厘米之间！");
            loadingElement.classList.add("hidden");
            return;
        }
        if (weight < 30 || weight > 200) {
            alert("体重应在 30-200 公斤之间！");
            loadingElement.classList.add("hidden");
            return;
        }
        if (exerciseFreq < 0 || exerciseFreq > 7) {
            alert("每周运动频率应在 0-7 次之间！");
            loadingElement.classList.add("hidden");
            return;
        }
        if (sedentaryHours < 0 || sedentaryHours > 24) {
            alert("久坐时间应在 0-24 小时之间！");
            loadingElement.classList.add("hidden");
            return;
        }

        const bmr = calculateBMR(weight, height, age, gender);
        const activityLevel = exerciseFreq <= 2 ? 1.2 : exerciseFreq <= 4 ? 1.55 : 1.9;
        let tdee = bmr * activityLevel;

        let targetCalories = tdee;
        if (goal === "fatLoss") targetCalories -= 500;
        else if (goal === "muscleGain") targetCalories += 400;

        const standardWeight = calculateStandardWeight(height, gender);
        const weightDiff = (weight - standardWeight).toFixed(1);
        const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

        // 生活习惯分析
        let lifestyleAnalysis = "";
        if (sedentaryHours >= 8) {
            lifestyleAnalysis += "- 久坐时间较长，每天久坐 " + sedentaryHours + " 小时，建议每小时起身活动5分钟，尝试站立办公或短时散步以改善血液循环。\n";
        } else if (sedentaryHours >= 4) {
            lifestyleAnalysis += "- 久坐时间适中，每天久坐 " + sedentaryHours + " 小时，建议保持适度活动，每2小时进行简单拉伸或走动。\n";
        } else {
            lifestyleAnalysis += "- 久坐时间较少，每天久坐 " + sedentaryHours + " 小时，良好的活动习惯有助于健康，建议继续保持。\n";
        }

        if (exerciseFreq <= 2) {
            lifestyleAnalysis += "- 运动频率较低，每周运动 " + exerciseFreq + " 次，建议增加至每周3-5次，每次30分钟以上，以增强心肺功能。\n";
        } else if (exerciseFreq <= 4) {
            lifestyleAnalysis += "- 运动频率适中，每周运动 " + exerciseFreq + " 次，建议保持规律运动，结合有氧和力量训练以全面提升体能。\n";
        } else {
            lifestyleAnalysis += "- 运动频率较高，每周运动 " + exerciseFreq + " 次，优秀的运动习惯，注意适当休息以避免过度训练。\n";
        }

        const sleepQuality = surveyResult ? surveyResult.sleepQuality : 3;
        if (sleepQuality <= 2) {
            lifestyleAnalysis += "- 睡眠质量较低（评分 " + sleepQuality + "/5），建议每晚保证7-8小时睡眠，避免睡前使用电子设备。\n";
        } else if (sleepQuality <= 3) {
            lifestyleAnalysis += "- 睡眠质量一般（评分 " + sleepQuality + "/5），建议优化睡眠环境，保持规律作息以提升睡眠质量。\n";
        } else {
            lifestyleAnalysis += "- 睡眠质量较好（评分 " + sleepQuality + "/5），良好的睡眠有助于恢复，建议继续保持。\n";
        }

        let trainingPlan = "";
        let scheduleData = [];
        const riskLevel = surveyResult ? surveyResult.riskLevel : "中";
        if (riskLevel === "高") {
            trainingPlan = "周一：太极拳 30分钟（低强度）\n周三：瑜伽 20分钟\n周五：轻量拉伸 15分钟";
            scheduleData = [
                ["周一", "太极拳 30分钟"],
                ["周三", "瑜伽 20分钟"],
                ["周五", "轻量拉伸 15分钟"]
            ];
        } else if (goal === "fatLoss") {
            trainingPlan = "周一：慢跑 30分钟（心率 120-140）\n周三：羽毛球 45分钟\n周五：全身力量训练 30分钟";
            scheduleData = [
                ["周一", "慢跑 30分钟"],
                ["周三", "羽毛球 45分钟"],
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
            trainingPlan = "周一：越野跑 5公里（心率 110-130）\n周三：游泳 40分钟\n周五：瑜伽 30分钟";
            scheduleData = [
                ["周一", "越野跑 5公里"],
                ["周三", "游泳 40分钟"],
                ["周五", "瑜伽 30分钟"]
            ];
        }

        let nutritionRatio = goal === "fatLoss" ? [30, 40, 30] : goal === "muscleGain" ? [35, 45, 20] : [25, 50, 25];
        const dietPlan = goal === "fatLoss" ?
            "早餐：燕麦 50g + 鸡蛋 2个\n午餐：鸡胸肉 100g + 糙米 100g\n晚餐：三文鱼 100g + 红薯 100g" :
            goal === "muscleGain" ?
            "早餐：燕麦 70g + 蛋白粉 30g\n午餐：牛肉 150g + 糙米 150g\n晚餐：鸡胸肉 120g + 蔬菜 200g" :
            "早餐：全麦面包 2片 + 鸡蛋 2个\n午餐：鸡胸肉 100g + 糙米 100g\n晚餐：鲈鱼 100g + 蔬菜 200g";

        const bodyOutput = document.getElementById("bodyOutput");
        const energyOutput = document.getElementById("energyOutput");
        const lifestyleOutput = document.getElementById("lifestyleOutput");
        const riskOutput = document.getElementById("riskOutput");
        const trainingOutput = document.getElementById("trainingOutput");
        const dietOutput = document.getElementById("dietOutput");

        if (!bodyOutput || !energyOutput || !lifestyleOutput || !riskOutput || !trainingOutput || !dietOutput) {
            alert("输出元素加载失败，请刷新页面重试！");
            loadingElement.classList.add("hidden");
            return;
        }

        bodyOutput.innerText = `
- BMI：${bmi}（正常范围：18.5-24.9）
- 当前体重 ${weight} kg，与标准体重 ${standardWeight.toFixed(1)} kg 相差 ${weightDiff} kg
        `;
        energyOutput.innerText = `
- 基础代谢率（BMR）：${Math.round(bmr)} kcal/天（维持基本生命活动所需的能量）
- 总每日能量消耗（TDEE）：${Math.round(tdee)} kcal/天（包括日常活动和运动的能量消耗）
        `;
        lifestyleOutput.innerText = lifestyleAnalysis;
        riskOutput.innerText = surveyResult ? `
- 风险等级：${surveyResult.riskLevel}
- 建议：${surveyResult.riskAdvice}
        ` : `
- 风险等级：未评估
- 建议：请完成运动风险问卷以获得个性化建议。
        `;
        trainingOutput.innerText = trainingPlan;
        dietOutput.innerText = `
- 每日热量需求：${Math.round(targetCalories)} kcal
- 营养比例：蛋白质 ${nutritionRatio[0]}%，碳水化合物 ${nutritionRatio[1]}%，脂肪 ${nutritionRatio[2]}%
${dietPlan}
        `;

        // 保存评估数据到健康档案
        const record = {
            timestamp: new Date().toLocaleString(),
            age,
            gender,
            height,
            weight,
            exerciseFreq,
            sedentaryHours,
            goal,
            heartRate: null,
            bloodPressure: null
        };
        healthRecords.push(record);
        localStorage.setItem("healthRecords", JSON.stringify(healthRecords));

        loadingElement.classList.add("hidden");
        resultElement.classList.remove("hidden");

        if (typeof echarts === "undefined") {
            alert("图表库加载失败，请检查网络连接！");
            return;
        }

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
        }

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
        }

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
        }
    }, 1000);
}

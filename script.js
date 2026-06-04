// Grading System
function getGradeAndPoints(marks) {
    if (marks >= 85) return { grade: "A", points: 4.00 };
    if (marks >= 80) return { grade: "A-", points: 3.67 };
    if (marks >= 75) return { grade: "B+", points: 3.34 };
    if (marks >= 71) return { grade: "B", points: 3.00 };
    if (marks >= 68) return { grade: "B-", points: 2.67 };
    if (marks >= 64) return { grade: "C+", points: 2.34 };
    if (marks >= 61) return { grade: "C", points: 2.01 };
    if (marks >= 58) return { grade: "C-", points: 1.67 };
    if (marks >= 54) return { grade: "D+", points: 1.31 };
    if (marks >= 50) return { grade: "D", points: 1.00 };
    return { grade: "F", points: 0.00 };
}

function neededFor4(ass1, ass2, mids, project, hasProject) {
    let midsVal = hasProject ? Math.min(mids, 15) : Math.min(mids, 30);
    let projVal = hasProject ? Math.min(project, 15) : 0;
    let totalSoFar = ass1 + ass2 + midsVal + projVal;
    let percentSoFar = (totalSoFar / 50) * 100;
    let needed = 170 - percentSoFar;
    if (needed <= 0) return "ACHIEVED";
    if (needed > 100) return "IMPOSSIBLE";
    return needed.toFixed(0);
}

function calculateGPA(ass1, ass2, mids, project, hasProject, finalMarks) {
    let midsVal = hasProject ? Math.min(mids, 15) : Math.min(mids, 30);
    let projVal = hasProject ? Math.min(project, 15) : 0;
    let totalSoFar = ass1 + ass2 + midsVal + projVal;
    let totalWithFinal = totalSoFar + (finalMarks / 2);
    let percentage = (totalWithFinal / 100) * 100;
    return getGradeAndPoints(percentage);
}

// Global State
let predictorCourses = [];
let showNeededMode = false;
let progressChart = null;
let transcriptCourses = [];
let transcriptChart = null;
let nextId = 1;

// ========== PREDICTOR FUNCTIONS ==========
function updatePredictorRow(idx) {
    let course = predictorCourses[idx];
    let finalValue = course.finalMarks !== undefined && course.finalMarks !== '' ? course.finalMarks : '';
    let hasFinal = finalValue !== '' && !isNaN(finalValue);
    let gpaData = hasFinal ? calculateGPA(course.ass1, course.ass2, course.mids, course.project || 0, course.hasProject, parseFloat(finalValue)) : { points: 0, grade: '-' };
    let needed = '';
    if (showNeededMode && !hasFinal) {
        needed = neededFor4(course.ass1, course.ass2, course.mids, course.project || 0, course.hasProject);
    }
    
    let row = document.querySelector(`#predictorTable tr[data-idx='${idx}']`);
    if (row) {
        let gpaDiv = row.querySelector('.gpa-value');
        let gradeDiv = row.querySelector('.grade-text');
        let neededCell = row.querySelector('.needed-cell');
        if (gpaDiv) gpaDiv.innerText = gpaData.points.toFixed(2);
        if (gradeDiv) gradeDiv.innerText = gpaData.grade;
        if (neededCell && showNeededMode) neededCell.innerText = needed;
        else if (neededCell && !showNeededMode) neededCell.innerText = '';
    }
    updateProgressGraph();
}

function renderPredictor() {
    let tbody = document.getElementById('predictorTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let hasAnyProject = predictorCourses.some(c => c.hasProject);
    document.getElementById('projectTh').style.display = hasAnyProject ? 'table-cell' : 'none';
    document.getElementById('neededTh').style.display = showNeededMode ? 'table-cell' : 'none';
    document.getElementById('showNeededToggle').innerText = `SHOW MARKS NEEDED FOR 4 GPA: ${showNeededMode ? 'ON' : 'OFF'}`;

    predictorCourses.forEach((course, idx) => {
        let finalValue = course.finalMarks !== undefined && course.finalMarks !== '' ? course.finalMarks : '';
        let hasFinal = finalValue !== '' && !isNaN(finalValue);
        let gpaData = hasFinal ? calculateGPA(course.ass1, course.ass2, course.mids, course.project || 0, course.hasProject, parseFloat(finalValue)) : { points: 0, grade: '-' };
        let needed = '';
        if (showNeededMode && !hasFinal) {
            needed = neededFor4(course.ass1, course.ass2, course.mids, course.project || 0, course.hasProject);
        }
        let row = document.createElement('tr');
        row.setAttribute('data-idx', idx);
        row.innerHTML = `
            <td><input type="text" class="subject-input course-name" value="${escapeHtml(course.name)}" placeholder="Course" style="min-width:140px;"></td>
            <td><input type="number" class="subject-input ass1-input" value="${course.ass1}" step="0.5" min="0" max="10" style="width:70px;"></td>
            <td><input type="number" class="subject-input ass2-input" value="${course.ass2}" step="0.5" min="0" max="10" style="width:70px;"></td>
            <td><input type="number" class="subject-input mids-input" value="${course.mids}" step="0.5" min="0" max="${course.hasProject ? 15 : 30}" style="width:70px;"></td>
            ${course.hasProject ? `<td><input type="number" class="subject-input project-input" value="${course.project || 0}" step="0.5" min="0" max="15" style="width:70px;"></td>` : '<td class="project-placeholder"></td>'}
            <td><input type="number" class="subject-input final-input" value="${finalValue}" step="1" min="0" max="100" placeholder="opt" style="width:80px;"></td>
            ${showNeededMode ? `<td class="needed-cell" style="text-align:center; color:#00FFD4; font-weight:bold;">${needed}</td>` : '<td class="needed-cell" style="display:none;">'}
            <td><div class="gpa-badge"><div class="gpa-value">${gpaData.points.toFixed(2)}</div><div class="grade-text" style="font-size:0.7rem;">${gpaData.grade}</div></div></td>
            <td><button class="btn-project-toggle toggle-project" data-idx="${idx}" style="padding:4px 10px;">${course.hasProject ? '✓ PROJECT' : '+ PROJECT'}</button></td>
            <td><button class="btn-glass remove-predictor" data-idx="${idx}" style="padding:4px 12px;">REMOVE</button></td>
        `;
        tbody.appendChild(row);
        
        let nameInput = row.querySelector('.course-name');
        let ass1Input = row.querySelector('.ass1-input');
        let ass2Input = row.querySelector('.ass2-input');
        let midsInput = row.querySelector('.mids-input');
        let finalInput = row.querySelector('.final-input');
        let projectInput = row.querySelector('.project-input');
        let toggleBtn = row.querySelector('.toggle-project');
        let removeBtn = row.querySelector('.remove-predictor');
        
        nameInput.addEventListener('change', (e) => { predictorCourses[idx].name = e.target.value; });
        ass1Input.addEventListener('input', (e) => { let v = parseFloat(e.target.value) || 0; if(v>10) v=10; predictorCourses[idx].ass1 = v; updatePredictorRow(idx); });
        ass2Input.addEventListener('input', (e) => { let v = parseFloat(e.target.value) || 0; if(v>10) v=10; predictorCourses[idx].ass2 = v; updatePredictorRow(idx); });
        midsInput.addEventListener('input', (e) => { 
            let v = parseFloat(e.target.value) || 0; 
            let max = predictorCourses[idx].hasProject ? 15 : 30; 
            if(v>max) v=max; 
            predictorCourses[idx].mids = v; 
            updatePredictorRow(idx); 
        });
        if (projectInput) {
            projectInput.addEventListener('input', (e) => { let v = parseFloat(e.target.value) || 0; if(v>15) v=15; predictorCourses[idx].project = v; updatePredictorRow(idx); });
        }
        finalInput.addEventListener('input', (e) => { predictorCourses[idx].finalMarks = e.target.value; updatePredictorRow(idx); });
        toggleBtn.addEventListener('click', () => {
            predictorCourses[idx].hasProject = !predictorCourses[idx].hasProject;
            if (!predictorCourses[idx].hasProject) {
                predictorCourses[idx].project = 0;
                if (predictorCourses[idx].mids > 30) predictorCourses[idx].mids = 30;
            } else {
                if (predictorCourses[idx].mids > 15) predictorCourses[idx].mids = 15;
            }
            renderPredictor();
        });
        removeBtn.addEventListener('click', () => { predictorCourses.splice(idx, 1); renderPredictor(); });
    });
    updateProgressGraph();
}

function updateProgressGraph() {
    let points = predictorCourses.map(c => {
        let midsVal = c.hasProject ? Math.min(c.mids, 15) : Math.min(c.mids, 30);
        let projVal = c.hasProject ? Math.min(c.project || 0, 15) : 0;
        let total = c.ass1 + c.ass2 + midsVal + projVal;
        let percent = (total / 50) * 100;
        if (c.finalMarks && c.finalMarks !== '' && !isNaN(c.finalMarks)) return (total + (parseFloat(c.finalMarks) / 2)) / 100 * 100;
        return percent;
    });
    let ctx = document.getElementById('progressGraph');
    if (!ctx) return;
    if (progressChart) progressChart.destroy();
    progressChart = new Chart(ctx, {
        type: 'line',
        data: { labels: points.map((_, i) => `C${i+1}`), datasets: [{ label: 'Progress %', data: points, borderColor: '#00FFD4', backgroundColor: 'rgba(0,255,212,0.05)', borderWidth: 3, tension: 0.3, fill: true, pointBackgroundColor: '#7B61FF', pointBorderColor: '#00FFD4', pointRadius: 5, pointHoverRadius: 8 }] },
        options: { responsive: true, maintainAspectRatio: true, animation: { duration: 800 }, plugins: { legend: { labels: { color: 'white' } } }, scales: { y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.08)' } }, x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } } } }
    });
}

// ========== TRANSCRIPT FUNCTIONS ==========
function renderTranscript() {
    let tbody = document.getElementById('transcriptTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    let totalQualityPoints = 0, totalCredits = 0;
    transcriptCourses.forEach((course, idx) => {
        let gp = getGradeAndPoints(course.marks);
        let qualityPoints = gp.points * course.credits;
        totalQualityPoints += qualityPoints;
        totalCredits += course.credits;
        let row = document.createElement('tr');
        row.setAttribute('data-tidx', idx);
        row.innerHTML = `
            <td><input type="text" class="subject-input code-input" value="${escapeHtml(course.code)}" style="width:100px;"></td>
            <td><input type="text" class="subject-input name-input" value="${escapeHtml(course.name)}" style="min-width:250px;"></td>
            <td><input type="number" class="subject-input credits-input" value="${course.credits}" step="0.5" min="0" style="width:70px;"></td>
            <td><input type="number" class="subject-input marks-input" value="${course.marks}" step="0.5" min="0" max="100" style="width:80px;"></td>
            <td class="grade-display" style="color:#00FFD4; font-weight:bold;">${gp.grade}</td>
            <td class="gpa-display" style="color:white; font-weight:bold;">${gp.points.toFixed(2)}</td>
            <td class="qp-display" style="color:rgba(255,255,255,0.7);">${qualityPoints.toFixed(2)}</td>
            <td><button class="btn-glass remove-transcript" data-tidx="${idx}" style="padding:4px 12px;">REMOVE</button></td>
        `;
        tbody.appendChild(row);
        
        let codeInput = row.querySelector('.code-input');
        let nameInput = row.querySelector('.name-input');
        let creditsInput = row.querySelector('.credits-input');
        let marksInput = row.querySelector('.marks-input');
        let removeBtn = row.querySelector('.remove-transcript');
        const updateTranscriptRow = () => {
            transcriptCourses[idx].code = codeInput.value;
            transcriptCourses[idx].name = nameInput.value;
            transcriptCourses[idx].credits = parseFloat(creditsInput.value) || 0;
            transcriptCourses[idx].marks = parseFloat(marksInput.value) || 0;
            renderTranscript();
        };
        codeInput.addEventListener('change', updateTranscriptRow);
        nameInput.addEventListener('change', updateTranscriptRow);
        creditsInput.addEventListener('input', updateTranscriptRow);
        marksInput.addEventListener('input', updateTranscriptRow);
        removeBtn.addEventListener('click', () => { transcriptCourses.splice(idx, 1); renderTranscript(); });
    });
    let overallCgpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
    let overallGradeObj = getGradeAndPoints(overallCgpa * 25);
    document.getElementById('overallCgpa').innerText = overallCgpa.toFixed(2);
    document.getElementById('overallGrade').innerText = overallGradeObj.grade;
    document.getElementById('totalCreditsDisplay').innerHTML = totalCredits;
    document.getElementById('totalQualityDisplay').innerHTML = totalQualityPoints.toFixed(2);
    updateTranscriptGraph();
}

function updateTranscriptGraph() {
    let gpas = transcriptCourses.map(c => getGradeAndPoints(c.marks).points);
    let ctx = document.getElementById('transcriptGraph');
    if (!ctx) return;
    if (transcriptChart) transcriptChart.destroy();
    transcriptChart = new Chart(ctx, {
        type: 'line',
        data: { labels: transcriptCourses.map(c => c.code), datasets: [{ label: 'GPA', data: gpas, borderColor: '#7B61FF', backgroundColor: 'rgba(123,97,255,0.05)', borderWidth: 3, tension: 0.3, fill: true, pointBackgroundColor: '#00FFD4', pointBorderColor: '#7B61FF', pointRadius: 6, pointHoverRadius: 9 }] },
        options: { responsive: true, maintainAspectRatio: true, animation: { duration: 800 }, plugins: { legend: { labels: { color: 'white' } } }, scales: { y: { max: 4, min: 0, grid: { color: 'rgba(255,255,255,0.08)' } }, x: { ticks: { color: 'rgba(255,255,255,0.7)' }, grid: { display: false } } } }
    });
}

// ========== EXCEL UPLOAD ==========
function handleExcelUpload(file) {
    let reader = new FileReader();
    reader.onload = function(evt) {
        let data = new Uint8Array(evt.target.result);
        let workbook = XLSX.read(data, { type: 'array' });
        let newCourses = [];
        for (let sheetName of workbook.SheetNames) {
            let sheet = workbook.Sheets[sheetName];
            let rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            if (!rows || rows.length === 0) continue;
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i];
                if (!row) continue;
                let firstCell = String(row[0] || '').toLowerCase();
                let secondCell = String(row[1] || '').toLowerCase();
                if ((firstCell.includes('semester') || secondCell.includes('course code')) && row.length >= 5) {
                    for (let j = i + 1; j < rows.length; j++) {
                        let dataRow = rows[j];
                        if (!dataRow || dataRow.length < 5) continue;
                        let code = dataRow[1] ? String(dataRow[1]).trim() : '';
                        let name = dataRow[2] ? String(dataRow[2]).trim() : '';
                        let credits = parseFloat(dataRow[3]);
                        let marks = parseFloat(dataRow[4]);
                        if (isNaN(credits)) credits = 3;
                        if (isNaN(marks)) continue;
                        if (code && name && marks > 0) newCourses.push({ code: code, name: name.substring(0, 80), credits: credits, marks: marks });
                    }
                    break;
                }
            }
        }
        if (newCourses.length) { transcriptCourses = newCourses; renderTranscript(); alert(`Loaded ${newCourses.length} courses from Excel`); }
        else alert("No course data found. Please ensure Excel has columns: Course Code, Title, Credits, Marks%");
    };
    reader.readAsArrayBuffer(file);
}

function escapeHtml(str) { 
    if (!str) return ''; 
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); 
}

// ========== TAB TRANSITION ==========
function switchTab(tab) {
    let predictorPanel = document.getElementById('predictorPanel');
    let transcriptPanel = document.getElementById('transcriptPanel');
    let predictorBtn = document.querySelector('.nav-btn[data-tab="predictor"]');
    let transcriptBtn = document.querySelector('.nav-btn[data-tab="transcript"]');
    if (tab === 'predictor') {
        transcriptPanel.classList.remove('active');
        setTimeout(() => { predictorPanel.classList.add('active'); predictorBtn.classList.add('active'); transcriptBtn.classList.remove('active'); setTimeout(() => updateProgressGraph(), 100); }, 50);
    } else {
        predictorPanel.classList.remove('active');
        setTimeout(() => { transcriptPanel.classList.add('active'); transcriptBtn.classList.add('active'); predictorBtn.classList.remove('active'); setTimeout(() => updateTranscriptGraph(), 100); }, 50);
    }
}

// ========== INITIAL DATA ==========
predictorCourses = [
    { id: nextId++, name: "MATHEMATICS", ass1: 8, ass2: 7, mids: 24, project: 0, finalMarks: '', hasProject: false },
    { id: nextId++, name: "DATABASE (DBMS)", ass1: 8, ass2: 7, mids: 12, project: 14, finalMarks: '', hasProject: true }
];
transcriptCourses = [
    { code: "CS101", name: "Introduction to Programming", credits: 4, marks: 84 },
    { code: "MATH101", name: "Calculus I", credits: 3, marks: 76 }
];

// ========== EVENT LISTENERS ==========
document.getElementById('showNeededToggle').onclick = () => { showNeededMode = !showNeededMode; renderPredictor(); };
document.getElementById('addCourseBtn').onclick = () => { predictorCourses.push({ id: nextId++, name: "NEW COURSE", ass1: 5, ass2: 5, mids: 15, project: 0, finalMarks: '', hasProject: false }); renderPredictor(); };
document.getElementById('calculateBtn').onclick = () => { renderPredictor(); };
document.getElementById('addTranscriptCourseBtn').onclick = () => { transcriptCourses.push({ code: "NEW", name: "New Course", credits: 3, marks: 70 }); renderTranscript(); };
document.getElementById('resetTranscriptBtn').onclick = () => { transcriptCourses = []; renderTranscript(); };
document.getElementById('uploadExcelBtn').onclick = () => document.getElementById('excelFile').click();
document.getElementById('excelFile').onchange = (e) => { if (e.target.files[0]) handleExcelUpload(e.target.files[0]); e.target.value = ''; };
document.querySelectorAll('.nav-btn').forEach(btn => { btn.onclick = () => switchTab(btn.dataset.tab); });
document.getElementById('landing').onclick = () => { document.getElementById('landing').classList.add('hide'); setTimeout(() => { document.getElementById('landing').style.display = 'none'; document.getElementById('dashboard').style.display = 'block'; }, 800); };

// ========== INITIAL RENDER ==========
renderPredictor();
renderTranscript();

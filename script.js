const surahSelect = document.getElementById('surah-select');
const quranContainer = document.getElementById('quran-container');
const playBtn = document.getElementById('play-btn');
const audioPlayer = document.getElementById('audio-player');

// 1. جلب قائمة السور وملء قائمة الاختيار
async function fetchSurahsList() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/meta/surah');
        const data = await response.json();
        const surahs = data.data.surahs.references;

        surahs.forEach(surah => {
            const option = document.createElement('option');
            option.value = surah.number;
            option.textContent = `${surah.number}. ${surah.name} (${surah.englishName})`;
            surahSelect.appendChild(option);
        });
        
        // جلب سورة الفاتحة افتراضياً (الرقم 1)
        fetchSurah(1); 

    } catch (error) {
        console.error('Error fetching surahs list:', error);
        quranContainer.innerHTML = '<p class="initial-message">حدث خطأ في جلب قائمة السور. يرجى التحقق من اتصالك بالإنترنت.</p>';
    }
}

// 2. جلب وتصيير (عرض) آيات السورة
async function fetchSurah(surahNumber) {
    quranContainer.innerHTML = '<p class="initial-message">جاري تحميل السورة... فضلاً انتظر.</p>';
    
    // إيقاف أي صوت يتم تشغيله
    audioPlayer.pause();
    audioPlayer.style.display = 'none';
    playBtn.textContent = 'تشغيل التلاوة 🎧';
    playBtn.disabled = false;

    try {
        // quran-simple-clean: لعرض النص بدون علامات ترقيم إضافية.
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.quran-simple-clean`);
        const data = await response.json();
        const surah = data.data;

        let contentHTML = `<h2>${surah.name}</h2>`;
        
        // إضافة البسملة في البداية (باستثناء سورة التوبة)
        if (surah.number !== 9) {
            contentHTML += `<span class="ayah"> بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ </span>`;
        }
        
        surah.ayahs.forEach(ayah => {
            // عرض نص الآية متبوعاً برقمها المزخرف
            contentHTML += `<span class="ayah">${ayah.text} <span class="ayah-number">﴿${ayah.numberInSurah}﴾</span></span>`;
        });

        quranContainer.innerHTML = contentHTML;
        
    } catch (error) {
        console.error('Error fetching surah:', error);
        quranContainer.innerHTML = '<p class="initial-message">حدث خطأ في عرض السورة. يرجى المحاولة لاحقاً.</p>';
    }
}

// 3. تشغيل التلاوة
function playRecitation() {
    const selectedSurahNumber = surahSelect.value;
    if (!selectedSurahNumber) {
        alert('يرجى اختيار سورة أولاً.');
        return;
    }
    
    // استخدام مصدر صوتي مشهور (قارئ العفاسي)
    const audioURL = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${selectedSurahNumber}.mp3`;
    
    audioPlayer.src = audioURL;
    audioPlayer.style.display = 'block'; // إظهار مشغل الصوت
    audioPlayer.load(); // تحميل ملف الصوت
    audioPlayer.play();
    playBtn.textContent = 'جاري التشغيل... 🔊';
    playBtn.disabled = true;

    // معالجة الانتهاء من التشغيل
    audioPlayer.onended = () => {
        playBtn.textContent = 'تشغيل التلاوة 🎧';
        playBtn.disabled = false;
        audioPlayer.style.display = 'none'; 
    };
    
    // معالجة خطأ التشغيل
    audioPlayer.onerror = () => {
        alert('عذراً، حدث خطأ أثناء تشغيل التلاوة أو الملف الصوتي غير متاح حالياً.');
        playBtn.textContent = 'تشغيل التلاوة 🎧';
        playBtn.disabled = false;
        audioPlayer.style.display = 'none';
    };
}

// 4. معالجة الأحداث (عند تغيير السورة أو الضغط على زر التشغيل)
surahSelect.addEventListener('change', (e) => {
    fetchSurah(e.target.value);
});

playBtn.addEventListener('click', playRecitation);

// بدء تشغيل البرنامج عند تحميل الصفحة
fetchSurahsList();

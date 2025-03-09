fetch('/cars')
    .then(res => res.json())
    .then(cars => {
        let carContainer = document.getElementById('car-list');
        carContainer.innerHTML = '';

        cars.forEach(car => {
            carContainer.innerHTML += `
                <div class="car-card">
                    <h3>${car.name}</h3>
                    <img src="/files/${car.image}" alt="صورة السيارة" width="200">
                    <a href="/files/${car.pdf}" target="_blank">📄 عرض الملف</a>
                    <video controls width="200">
                        <source src="/files/${car.video}" type="video/mp4">
                    </video>
                </div>
            `;
        });
    })
    .catch(error => console.error('خطأ في تحميل السيارات:', error));
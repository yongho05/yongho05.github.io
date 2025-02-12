let allEvents = []; // 모든 이벤트를 저장할 배열
let filteredEvents = []; // 필터링된 이벤트 배열
let currentPage = 1; // 현재 페이지
const eventsPerPage = 10; // 페이지당 표시할 이벤트 수

document.getElementById('searchEvents').addEventListener('click', searchEvents);

async function fetchCulturalEvents() {
    const apiKey = '42494a5171696f6b37374b474c5a61'; // 인증키
    const startIndex = 1; // 요청 시작 위치
    const endIndex = 1000; // 요청 종료 위치

    const url = `http://openapi.seoul.go.kr:8088/${apiKey}/xml/culturalEventInfo/${startIndex}/${endIndex}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('네트워크 응답에 문제가 있습니다.');
        }
        const data = await response.text();
        parseAndDisplayEvents(data);
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        document.getElementById('eventList').innerHTML = `<p>데이터를 가져오는 중 오류가 발생했습니다: ${error.message}</p>`;
    }
}

function parseAndDisplayEvents(xmlData) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'application/xml');
    const events = xmlDoc.getElementsByTagName('row');

    allEvents = []; // 배열 초기화

    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const title = event.getElementsByTagName('TITLE')[0]?.textContent || '정보 없음';
        const date = event.getElementsByTagName('DATE')[0]?.textContent || '정보 없음';
        const place = event.getElementsByTagName('PLACE')[0]?.textContent || '정보 없음';
        const MAIN_IMG = event.getElementsByTagName('MAIN_IMG')[0]?.textContent || '';
        const CODENAME = event.getElementsByTagName('CODENAME')[0]?.textContent || '정보 없음';
        const ORG_LINK = event.getElementsByTagName('ORG_LINK')[0]?.textContent || '';

        allEvents.push({ title, date, place, MAIN_IMG, CODENAME, ORG_LINK });
    }

    displayEvents(); // 기본 이벤트 표시
}

function searchEvents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // 이벤트 필터링
    filteredEvents = allEvents.filter(event => {
        const eventDate = event.date;

        const titleMatch = event.title.toLowerCase().includes(searchTerm) || 
                           event.CODENAME.toLowerCase().includes(searchTerm);

        const isWithinDateRange = (!startDate || eventDate >= startDate) && (!endDate || eventDate <= endDate);

        return titleMatch && isWithinDateRange;
    });

    currentPage = 1; // 검색 후 첫 페이지로 초기화
    displayEvents(); // 필터링된 이벤트 표시
}

function displayEvents() {
    const eventsToDisplay = filteredEvents.length > 0 ? filteredEvents : allEvents; // 필터링된 이벤트가 없을 경우 전체 이벤트 표시
    const start = (currentPage - 1) * eventsPerPage;
    const end = start + eventsPerPage;
    const currentEvents = eventsToDisplay.slice(start, end); // 현재 페이지의 이벤트만 선택

    let eventHTML = '';
    currentEvents.forEach(event => {
        eventHTML += `
            <div class="event">
                <div class="event-info">
                    <h2>${event.title}</h2>
                    <p><strong>날짜:</strong> ${event.date}</p>
                    <p><strong>장소:</strong> ${event.place}</p>
                    <p><strong>분류:</strong> ${event.CODENAME}</p>
                    <button onclick="window.open('${event.ORG_LINK}', '_blank')">Homepage</button>
                    <button onclick="openMap('${event.place}')">See the location</button>
                </div>
                ${event.MAIN_IMG ? `<img src="${event.MAIN_IMG}" alt="${event.title}" class="event-image">` : ''}
            </div>
        `;
    });

    document.getElementById('eventList').innerHTML = eventHTML || '<p>검색 결과가 없습니다.</p>';
    updatePaginationButtons(); // 페이지 버튼 상태 업데이트
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
    currentPage += direction;

    // 페이지 범위 확인
    if (currentPage < 1) {
        currentPage = 1; // 첫 페이지 유지
    } else if (currentPage > totalPages) {
        currentPage = totalPages; // 마지막 페이지 유지
    }

    displayEvents(); // 이벤트 다시 표시
}

function updatePaginationButtons() {
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
    document.getElementById('prevPage').disabled = currentPage === 1; // 첫 페이지에서 "이전" 버튼 비활성화
    document.getElementById('nextPage').disabled = currentPage === totalPages; // 마지막 페이지에서 "다음" 버튼 비활성화
}

function openMap(place) {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
    window.open(mapUrl, '_blank');
}

// 페이지 로드 시 기본 이벤트 가져오기
fetchCulturalEvents();

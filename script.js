const isLeapYear = (year) => {
    return (
        (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
    );
};

const getFebDays = (year) => {
    return isLeapYear(year) ? 29 : 28;
};

const fetchHolidays = async (year, month) => {
    try {
        const response = await fetch(`https://calendarific.com/api/v2/holidays?api_key=baa9dc110aa712sd3a9fa2a3dwb6c01d4c875950dc32vs&country=US&year=${year}&month=${month + 1}`);
        const data = await response.json();
        return data.response.holidays;
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return [];
    }
};

const getGoogleCalendarHolidayInfo = async (date) => {
    try {
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/events?key=YOUR_API_KEY&timeMin=${date.toISOString()}&timeMax=${date.toISOString()}`);
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Error fetching holiday information from Google Calendar:', error);
        return [];
    }
};

const generateHolidayEntries = async (year, month) => {
    const holidays = await fetchHolidays(year, month);
    const calendarDays = document.querySelector('.calendar-days');

    holidays.forEach(holiday => {
        const day = document.createElement('div');
        day.innerHTML = holiday.name; // Display holiday name
        // Apply a special class or style to distinguish holidays
        day.classList.add('holiday');

        // Check if the holiday falls within the current month and year
        const holidayDate = new Date(holiday.date.iso);
        if (holidayDate.getMonth() === month && holidayDate.getFullYear() === year) {
            // Add a class to style the calendar day representing the holiday
            day.classList.add('holiday-date');
        }

        // Append holiday entry to the calendar
        calendarDays.appendChild(day);
    });
};

let calendar = document.querySelector('.calendar');
const month_names = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];
let month_picker = document.querySelector('#month-picker');
const dayTextFormat = document.querySelector('.day-text-formate');
const timeFormat = document.querySelector('.time-formate');
const dateFormat = document.querySelector('.date-formate');

month_picker.onclick = () => {
    month_list.classList.remove('hideonce');
    month_list.classList.remove('hide');
    month_list.classList.add('show');
    dayTextFormat.classList.remove('showtime');
    dayTextFormat.classList.add('hidetime');
    timeFormat.classList.remove('showtime');
    timeFormat.classList.add('hideTime');
    dateFormat.classList.remove('showtime');
    dateFormat.classList.add('hideTime');
};

const showDateInfo = async (date) => {
    const holidayInfo = await getGoogleCalendarHolidayInfo(date);
    if (holidayInfo.length > 0) {
        let holidayNames = holidayInfo.map(holiday => holiday.summary).join(', ');
        alert(`Holiday(s) on ${date.toLocaleDateString()}: ${holidayNames}`);
    } else {
        alert(`No holidays on ${date.toLocaleDateString()}.`);
    }
};


const generateCalendar = async (month, year) => {
    let calendar_days = document.querySelector('.calendar-days');
    calendar_days.innerHTML = '';
    let calendar_header_year = document.querySelector('#year');
    let days_of_month = [
        31, getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ];

    month_picker.innerHTML = month_names[month];
    calendar_header_year.innerHTML = year;

    let first_day = new Date(year, month);

    for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
        let day = document.createElement('div');
        if (i >= first_day.getDay()) {
            day.innerHTML = i - first_day.getDay() + 1;
            day.addEventListener('click', () => {
                const clickedDate = new Date(year, month, i - first_day.getDay() + 1);
                showDateInfo(clickedDate);
            });
            if (i - first_day.getDay() + 1 === new Date().getDate() &&
                year === new Date().getFullYear() &&
                month === new Date().getMonth()
            ) {
                day.classList.add('current-date');
            }
        }
        calendar_days.appendChild(day);
    }

    // Generate holiday entries
    await generateHolidayEntries(year, month);
};

let month_list = calendar.querySelector('.month-list');
month_names.forEach((e, index) => {
    let month = document.createElement('div');
    month.innerHTML = `<div>${e}</div>`;

    month_list.append(month);
    month.onclick = async () => {
        currentMonth.value = index;
        await generateCalendar(index, currentYear.value);
        month_list.classList.replace('show', 'hide');
        dayTextFormat.classList.remove('hideTime');
        dayTextFormat.classList.add('showtime');
        timeFormat.classList.remove('hideTime');
        timeFormat.classList.add('showtime');
        dateFormat.classList.remove('hideTime');
        dateFormat.classList.add('showtime');
    };
});

(function () {
    month_list.classList.add('hideonce');
})();

document.querySelector('#pre-year').onclick = async () => {
    --currentYear.value;
    await generateCalendar(currentMonth.value, currentYear.value);
};

document.querySelector('#next-year').onclick = async () => {
    ++currentYear.value;
    await generateCalendar(currentMonth.value, currentYear.value);
};

let currentDate = new Date();
let currentMonth = { value: currentDate.getMonth() };
let currentYear = { value: currentDate.getFullYear() };
generateCalendar(currentMonth.value, currentYear.value);

const todayShowTime = document.querySelector('.time-formate');
const todayShowDate = document.querySelector('.date-formate');

const currshowDate = new Date();
const showCurrentDateOption = {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
};
const currentDateFormate = new Intl.DateTimeFormat('en-US', showCurrentDateOption).format(currshowDate);
todayShowDate.textContent = currentDateFormate;

setInterval(() => {
    const timer = new Date();
    const option = {
        hour: 'numeric', minute: 'numeric', second: 'numeric'
    };
    const formateTimer = new Intl.DateTimeFormat('en-us', option).format(timer);
    let time = `${`${timer.getHours()}`.padStart(2, '0')}:${`${timer.getMinutes()}`.padStart(2, '0')}: ${`${timer.getSeconds()}`.padStart(2, '0')}`;
    todayShowTime.textContent = formateTimer;
}, 1000);

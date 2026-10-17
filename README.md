# 📊 Statistics of Requirements in IT Vacancies

## 📝 Description

**Statistics of Requirements in IT Vacancies** looks at the IT job market in **Kazan**. It is built on openings from [hh.ru](https://hh.ru), a major job board in Russia.

The project covers several career tracks — analytics, engineering, design, management, testing, and methodology. For each of them it surfaces the skills employers mention most often, the experience levels they ask for, and the work formats they offer.

### Visualization

The page opens with a **word cloud** of the top skills across all vacancies. Below it, category buttons switch charts for **experience** and **work format**, and show the job titles that belong to the chosen track.

---

## 🛠️ Tech Stack

[![Python][Python]][Python-url]
[![Pandas][Pandas]][Pandas-url]
[![Requests][Requests]][Requests-url]
[![D3.js][D3.js]][D3.js-url]
[![HTML5][HTML5]][HTML5-url]
[![CSS3][CSS3]][CSS3-url]
[![JavaScript][JavaScript]][JavaScript-url]

[Python]: https://img.shields.io/badge/Python-000000?style=for-the-badge&logo=python&logoColor=3776AB
[Python-url]: https://www.python.org/
[Pandas]: https://img.shields.io/badge/Pandas-000000?style=for-the-badge&logo=pandas&logoColor=150458
[Pandas-url]: https://pandas.pydata.org/
[Requests]: https://img.shields.io/badge/Requests-000000?style=for-the-badge&logo=python&logoColor=3776AB
[Requests-url]: https://requests.readthedocs.io/
[D3.js]: https://img.shields.io/badge/D3.js-000000?style=for-the-badge&logo=d3.js&logoColor=F9A03C
[D3.js-url]: https://d3js.org/
[HTML5]: https://img.shields.io/badge/HTML5-000000?style=for-the-badge&logo=html5&logoColor=E34F26
[HTML5-url]: https://developer.mozilla.org/en-US/docs/Web/HTML
[CSS3]: https://img.shields.io/badge/CSS3-000000?style=for-the-badge&logo=css3&logoColor=1572B6
[CSS3-url]: https://developer.mozilla.org/en-US/docs/Web/CSS
[JavaScript]: https://img.shields.io/badge/JavaScript-000000?style=for-the-badge&logo=javascript&logoColor=F7DF1E
[JavaScript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript

---

## 🚀 How to Run

You need **Python 3.8+** and a modern browser.

### Install dependencies

```bash
pip install -r requirements.txt
```

### Collect fresh data (optional)

The `docs` folder already contains prepared data, so you can skip this step and open the visualization right away.

To download the latest vacancies and rebuild the dataset, run from the project root:

```bash
python main.py
```

### Open the visualization

Open `docs/index.html` in your browser, or serve the `docs` folder with a local server:

```bash
cd docs
python -m http.server 8000
```

Then go to [http://localhost:8000](http://localhost:8000).

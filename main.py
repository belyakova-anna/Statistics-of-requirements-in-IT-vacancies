from parser import parse_vacancies as run_parser
from transform import prepare_for_d3, load_data

def main():
    # Скачиваем данные (в CSV)
    # run_parser()

    # Загружаем данные, преобразуем для D3
    df = load_data("data/vacancies.csv")
    prepare_for_d3(df)

if __name__ == "__main__":
    main()

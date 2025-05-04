from parser import parse_vacancies as run_parser
from transform import prepare_for_d3, load_data

def main():
    # Download data (in CSV)
    run_parser()

    # Load data, convert for D3
    df = load_data("docs/data/vacancies.csv")
    prepare_for_d3(df)

if __name__ == "__main__":
    main()

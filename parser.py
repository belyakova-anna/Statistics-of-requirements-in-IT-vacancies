import requests
import time
import csv
import os

# Function to clean up non-breaking spaces
def clean_spaces(text):
    if isinstance(text, str):
        return text.replace('\u00A0', ' ')
    return text

# Function to save the mapping of role IDs to professional role names
def save_professional_roles_mapping(output_file="docs/data/professional_roles.csv", role_ids=None):
    url = "https://api.hh.ru/professional_roles"
    headers = {
        "User-Agent": "MyApp/1.0 (my-app-feedback@example.com)",
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Error: {response.status_code} - {response.text}")
        return

    data = response.json()

    # Collect all roles into a dictionary: id -> name
    all_roles = {}
    for category in data.get('categories', []):
        for role in category.get('roles', []):
            all_roles[int(role['id'])] = role['name']

    roles = []
    for role_id in role_ids or []:
        name = all_roles.get(role_id)
        if name:
            roles.append({
                "id": role_id,
                "name": name
            })
        else:
            print(f"Role with ID {role_id} not found in the HH directory")

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["id", "name"])
        for role in roles:
            writer.writerow([role['id'], role['name']])

    print(f"Professional role mapping saved to {output_file}")

# Main function to parse job vacancies
def parse_vacancies(output_file="docs/data/vacancies.csv"):
    url = "https://api.hh.ru/vacancies"
    headers = {
        "User-Agent": "api-test-agent"
    }

    professional_role_ids = [
        156, 160, 10, 12, 150, 25, 165, 34, 36, 73, 155,
        96, 164, 104, 157, 107, 112, 113, 148, 114, 116, 124, 125, 126
    ]

    # Save the list of professional roles to CSV
    save_professional_roles_mapping("docs/data/professional_roles.csv", professional_role_ids)

    params = {
        "area": 88,
        "professional_role": professional_role_ids,
        "per_page": 100,
        "page": 0
    }

    all_vacancies = []

    while True:
        response = requests.get(url, headers=headers, params=params, verify=False)
        data = response.json()

        items = data.get('items', [])
        all_vacancies.extend(items)

        print(f"Page {params['page'] + 1} loaded, vacancies collected: {len(all_vacancies)}")

        if params['page'] >= data.get('pages', 0) - 1:
            break

        params['page'] += 1
        time.sleep(0.2)

    print(f"Total vacancies collected: {len(all_vacancies)}")

    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow([
            "id", "name", "key_skills",
            "work_format_name", "experience", "specialization_id"
        ])

        for vacancy in all_vacancies:
            vacancy_id = vacancy.get("id", "")
            name = vacancy.get("name", "")

            # Fetch vacancy details
            vacancy_url = f"https://api.hh.ru/vacancies/{vacancy_id}"
            vacancy_response = requests.get(vacancy_url, headers=headers)
            if vacancy_response.status_code == 200:
                vacancy_data = vacancy_response.json()
                key_skills = [skill["name"] for skill in vacancy_data.get("key_skills", [])]

                work_format_name = ""
                if isinstance(vacancy_data.get("work_format", []), list) and vacancy_data["work_format"]:
                    work_format_name = clean_spaces(vacancy_data["work_format"][0].get("name", ""))

                experience = vacancy_data.get("experience", {}).get("name", "")

                roles = vacancy_data.get("professional_roles", [])
                specialization_ids = [str(role["id"]) for role in roles]
                specialization_id = specialization_ids[0] if specialization_ids else ""
            else:
                key_skills = []
                work_format_name = ""
                experience = ""
                specialization_id = ""

            key_skills_str = ", ".join(key_skills)

            # Write vacancy data to CSV
            writer.writerow([
                vacancy_id,
                name,
                key_skills_str,
                work_format_name,
                experience,
                specialization_id
            ])

            time.sleep(0.2)

    print(f"Vacancies saved to {output_file}")

# Run the parser
if __name__ == "__main__":
    parse_vacancies()

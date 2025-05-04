from collections import Counter, defaultdict
import pandas as pd
import json

# Specialization categories based on specialization_id
SPECIALIZATION_CATEGORIES = {
    "Analytics and Data": {156, 10, 150, 164, 165, 96, 148},
    "Design and Creative": {12, 25, 34},
    "Management and Leadership": {36, 73, 104, 157, 107, 125},
    "Engineering and Infrastructure": {160, 112, 113, 114, 116},
    "Testing and Documentation": {124, 126},
    "Methodology": {155}
}

# Function to map specialization ID to its corresponding category
def get_category(spec_id):
    for category, ids in SPECIALIZATION_CATEGORIES.items():
        if spec_id in ids:
            return category
    return None

# Function to load data from a CSV file
def load_data(path="docs/data/vacancies.csv"):
    return pd.read_csv(path)

# Function to prepare the data for D3 visualization and save it as a JSON file
def prepare_for_d3(df, out_path="docs/data/vacancies.json", roles_path="docs/data/professional_roles.csv"):
    # Convert specialization_id to numeric
    df = df.assign(specialization_id=pd.to_numeric(df["specialization_id"], errors="coerce").astype("Int64"))

    # Load the role ID to name mapping
    roles_df = pd.read_csv(roles_path)
    role_id_to_name = dict(zip(roles_df["id"], roles_df["name"]))

    # Count key skills and get the top 20 most frequent ones
    key_skills_counter = Counter()
    for key_skills in df["key_skills"].dropna():
        skills = [skill.strip().lower() for skill in key_skills.split(",")]
        key_skills_counter.update(skills)
    top_key_skills = dict(key_skills_counter.most_common(20))

    # Structure to store categories data
    categories = defaultdict(lambda: {
        "experience": defaultdict(int),
        "work_format": defaultdict(int),
        "job_names": []
    })

    # Populate job names from the SPECIALIZATION_CATEGORIES mapping
    for category, ids in SPECIALIZATION_CATEGORIES.items():
        job_names = [role_id_to_name.get(role_id) for role_id in ids if role_id in role_id_to_name]
        categories[category]["job_names"] = sorted(filter(None, job_names))  # Remove None values and sort

    # Count experience and work format by category
    for _, row in df.iterrows():
        spec_id = row["specialization_id"]
        experience = str(row.get("experience", "")).strip()
        work_format_name = str(row.get("work_format_name", "")).strip()

        if pd.isna(spec_id) or not experience:
            continue

        category = get_category(spec_id)
        if category:
            categories[category]["experience"][experience] += 1
            if work_format_name and work_format_name.lower() != "nan":
                categories[category]["work_format"][work_format_name] += 1

    # Final structure to export as JSON
    data_to_export = {
        "top_key_skills": top_key_skills,
        "categories": categories
    }

    # Save the data to a JSON file
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data_to_export, f, ensure_ascii=False, indent=2)

    print(f"File saved at {out_path}")

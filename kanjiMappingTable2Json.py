import json


def process_kanji_mapping_v2(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Skipping the introductory lines
    lines = [line.strip().split("\t") for line in lines]

    j_to_c = {}
    t_to_j = {}
    s_to_j = {}

    for line in lines:
        if len(line) != 3:
            print(f"Unexpected format: {line}")
            continue

        japanese, traditional, simplified = line

        # Storing Japanese to Chinese mappings
        j_to_c[japanese] = {"T": traditional.split(","), "S": simplified.split(",")}

        # Storing Traditional to Japanese mappings
        for t_char in traditional.split(","):
            t_to_j[t_char] = japanese

        # Storing Simplified to Japanese mappings
        for s_char in simplified.split(","):
            s_to_j[s_char] = japanese

    return j_to_c, t_to_j, s_to_j


# Process the file and get the mappings
j_to_c, t_to_j, s_to_j = process_kanji_mapping_v2("kanji_mapping_table.txt")

# Store the mappings as JSON files
with open("japanese_to_chinese.json", "w", encoding="utf-8") as f:
    json.dump(j_to_c, f, ensure_ascii=False, indent=4)

with open("traditional_to_japanese.json", "w", encoding="utf-8") as f:
    json.dump(t_to_j, f, ensure_ascii=False, indent=4)

with open("simplified_to_japanese.json", "w", encoding="utf-8") as f:
    json.dump(s_to_j, f, ensure_ascii=False, indent=4)

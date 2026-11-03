from pathlib import Path

env_file = Path(__file__).resolve().parents[2] / ".env"

def load_env(file_path: Path) -> dict[str, str]:
    env_dict = {}
    with open(file_path, encoding='utf-8') as f:
        lines = f.readlines()
        for line in lines:
            line = line.strip()
            if len(line) == 0:
                continue
            elif line[0] == '#':
                continue
            else:
                pair = line.split("=", 1)
                env_dict[pair[0].strip()] = pair[1].strip()
    return env_dict

if __name__ == "__main__":
    env_dict = load_env(env_file)
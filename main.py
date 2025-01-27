import yaml

with open('TarpulinopenAPIspec.yaml', 'r') as file:
    content = yaml.safe_load(file)
    print(yaml.dump(content, sort_keys=False, indent=4))
try:
    with open('error_debug_2.log', 'r', encoding='utf-16') as f:
        print(f.read())
except Exception as e:
    print(f"UTF-16 failed: {e}")
    try:
        with open('error_debug_2.log', 'r') as f:
            print(f.read())
    except Exception as e2:
        print(f"Default failed: {e2}")

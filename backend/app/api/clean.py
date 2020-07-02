

def lowercase(dirty_rows, column_name):
    cleaned_rows = []
    for row in dirty_rows:
        clean_row = row
        clean_row[column_name] = row[column_name].lower()
        cleaned_rows.append(clean_row)
    return cleaned_rows
    

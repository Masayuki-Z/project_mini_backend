import 'dart:io';
import 'package:http/http.dart' as http;

void main() async {
  await addExpense();
}

Future<void> addExpense() async {
  print("===== Login =====");

  // Get Username
  stdout.write("Username: ");
  String? username = stdin.readLineSync()?.trim();

  // Get Password
  stdout.write("Password: ");
  String? paidStr = stdin.readLineSync()?.trim();

  print("========= Expense Tracking App =========");
  print("Welcome $username");

  String? item = stdin.readLineSync()?.trim();
  // Validate input
  if (item == null || item.isEmpty || paidStr == null || paidStr.isEmpty) {
    print("\nError: Item name and amount cannot be empty.");
    return;
  }
  if (double.tryParse(paidStr) == null) {
    print("\nError: Amount paid must be a valid number.");
    return;
  }

  // Prepare data for the POST request
  final url = Uri.parse('http://localhost:3000/expenses');
  final body = {'item': item, 'paid': paidStr};

  try {
    final response = await http.post(url, body: body);
    // Print the confirmation or error message from the server
    print("\n${response.body}");
  } catch (e) {
    print("\nError: Could not connect to the server.");
  }
}

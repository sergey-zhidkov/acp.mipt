import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

class CostCalculator {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int numTestCases = Integer.parseInt(in.readLine().trim());

        for (int i = 0; i < numTestCases; i++) {
            int basePrice = Integer.parseInt(in.readLine().trim());
            String addressString = in.readLine();
            Address addr = new Address(addressString);

            int taxAmount = TaxCalculator.calculateTax(basePrice, addr.getState());
            int shippingAmount = ShippingCalculator.calculateShipping(addr.getZipCode());

            System.out.println(basePrice + taxAmount + shippingAmount);
        }
    }
}

class Address {
    public String addressLine;

    public Address(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getStreetAddress() {
        String[] splitedAddressLine = addressLine.split(",");
        final int USUAL_COMMAS_IN_ADDRESS_LINE = 3;
        String streetAddress = "";
        // in case of multiple parts of address line for street address
        for (int i = 0; i <= splitedAddressLine.length - USUAL_COMMAS_IN_ADDRESS_LINE; i++) {
            streetAddress += splitedAddressLine[i].trim() + ", ";
        }

        return streetAddress.substring(0, streetAddress.length() - 2);
    }

    public String getCityName() {
        //the city should be second from the end
        String[] splitedAddressLine = addressLine.split(",");
        return splitedAddressLine[splitedAddressLine.length - 2];
    }

    public String getState() {
        //state appears last in the address line
        String[] splitedAddressLine = addressLine.split(",");
        String stateLine = splitedAddressLine[splitedAddressLine.length - 1].trim();
        return stateLine.split(" ")[0].trim();
    }

    public int getZipCode() {
        String[] splitedAddressLine = addressLine.split(",");
        String stateLine = splitedAddressLine[splitedAddressLine.length - 1].trim();
        int consecutiveDigits = 0;

        //search for something that matches 5 consecutive digits only in the state line
        for (int i = 0; i < stateLine.length(); i++) {
            char c = stateLine.charAt(i);
            if (Character.isDigit(c)) {
                consecutiveDigits++;
                if (consecutiveDigits == 5) {
                    return Integer.parseInt(stateLine.substring(i - 4, i + 1));
                }
            } else {
                consecutiveDigits = 0;
            }
        }

        //should never happen
        return 0;
    }
}

class TaxCalculator {
    public static int calculateTax(int orderAmount, String state) {
        if (state.equalsIgnoreCase("Arizona") || state.equalsIgnoreCase("AZ")) {
            return orderAmount / 100 * 5;
        }
        if (state.equalsIgnoreCase("Washington") || state.equalsIgnoreCase("WA")) {
            return orderAmount / 100 * 9;
        }
        if (state.equalsIgnoreCase("California") || state.equalsIgnoreCase("CA")) {
            return orderAmount / 100 * 6;
        }
        if (state.equalsIgnoreCase("Delaware") || state.equalsIgnoreCase("DE")) {
            return 0;
        }
        return orderAmount / 100 * 7;
    }
}

class ShippingCalculator {
    public static int calculateShipping(int zipCode) {
        if (zipCode > 75000) {
            return 10;
        } else if (zipCode >= 25000) {
            return 20;
        } else {
            return 30;
        }
    }
}
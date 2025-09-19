import { RequestData } from "@/types/rest-client";

export const generateCode = (
  request: RequestData,
  language: string,
): string => {
  const { method, url, headers, body } = request;
  const enabledHeaders = headers.filter((h) => h.enabled && h.key && h.value);

  if (!url) {
    return `// Please enter a URL to generate ${language} code`;
  }

  switch (language) {
    case "curl":
      let curlCmd = `curl -X ${method}`;
      enabledHeaders.forEach((h) => {
        curlCmd += ` \\\n  -H "${h.key}: ${h.value}"`;
      });
      if (body && ["POST", "PUT", "PATCH"].includes(method)) {
        curlCmd += ` \\\n  -d '${body}'`;
      }
      curlCmd += ` \\\n  "${url}"`;
      return curlCmd;

    case "fetch":
      const fetchHeaders =
        enabledHeaders.length > 0
          ? `    headers: {\n${enabledHeaders
              .map((h) => `      '${h.key}': '${h.value}'`)
              .join(",\n")}\n    },`
          : "";
      const fetchBody =
        body && ["POST", "PUT", "PATCH"].includes(method)
          ? `    body: ${JSON.stringify(body)},`
          : "";
      return `fetch('${url}', {
  method: '${method}',${fetchHeaders ? "\n" + fetchHeaders : ""}${
    fetchBody ? "\n" + fetchBody : ""
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;

    case "xhr":
      const xhrHeaders = enabledHeaders
        .map((h) => `xhr.setRequestHeader('${h.key}', '${h.value}');`)
        .join("\n");
      const xhrBody =
        body && ["POST", "PUT", "PATCH"].includes(method)
          ? `xhr.send(${JSON.stringify(body)});`
          : "xhr.send();";
      return `const xhr = new XMLHttpRequest();
xhr.open('${method}', '${url}');
${xhrHeaders}

xhr.onreadystatechange = function() {
  if (xhr.readyState === 4) {
    if (xhr.status === 200) {
      console.log(xhr.responseText);
    } else {
      console.error('Request failed:', xhr.statusText);
    }
  }
};

${xhrBody}`;

    case "nodejs":
      const isHttps = url.startsWith("https://");
      const protocol = isHttps ? "https" : "http";
      const nodeHeaders =
        enabledHeaders.length > 0
          ? `    headers: {\n${enabledHeaders
              .map((h) => `      '${h.key}': '${h.value}'`)
              .join(",\n")}\n    },`
          : "";
      const nodeBody =
        body && ["POST", "PUT", "PATCH"].includes(method) ? body : null;

      return `const ${protocol} = require('${protocol}');
const url = require('url');

const options = {
  method: '${method}',${nodeHeaders ? "\n" + nodeHeaders : ""}
};

const req = ${protocol}.request('${url}', options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

${nodeBody ? `req.write(${JSON.stringify(nodeBody)});` : ""}
req.end();`;

    case "python":
      const pythonHeaders =
        enabledHeaders.length > 0
          ? `headers = {\n${enabledHeaders
              .map((h) => `    '${h.key}': '${h.value}'`)
              .join(",\n")}\n}`
          : "headers = {}";
      const pythonData =
        body && ["POST", "PUT", "PATCH"].includes(method)
          ? `, data=${JSON.stringify(body)}`
          : "";
      return `import requests
import json

${pythonHeaders}

try:
    response = requests.${method.toLowerCase()}(
        '${url}',
        headers=headers${pythonData}
    )
    response.raise_for_status()
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")`;

    case "java":
      const javaHeaders = enabledHeaders
        .map((h) => `        request.header("${h.key}", "${h.value}");`)
        .join("\n");
      const javaBody =
        body && ["POST", "PUT", "PATCH"].includes(method)
          ? `        request.POST(HttpRequest.BodyPublishers.ofString(${JSON.stringify(
              body,
            )}));`
          : "";

      return `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

public class RestClient {
    public static void main(String[] args) {
        HttpClient client = HttpClient.newHttpClient();
        
        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
            .uri(URI.create("${url}"));
            
${javaHeaders}
${javaBody}
        
        HttpRequest request = requestBuilder.build();
        
        try {
            HttpResponse<String> response = client.send(request, 
                HttpResponse.BodyHandlers.ofString());
                
            System.out.println("Status: " + response.statusCode());
            System.out.println("Response: " + response.body());
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`;

    case "csharp":
      const csharpHeaders = enabledHeaders
        .map(
          (h) =>
            `            client.DefaultRequestHeaders.Add("${h.key}", "${h.value}");`,
        )
        .join("\n");
      const csharpBody =
        body && ["POST", "PUT", "PATCH"].includes(method)
          ? `            var content = new StringContent(${JSON.stringify(
              body,
            )}, Encoding.UTF8, "application/json");
            var response = await client.${
              method === "POST"
                ? "PostAsync"
                : method === "PUT"
                  ? "PutAsync"
                  : "PatchAsync"
            }("${url}", content);`
          : `            var response = await client.${method}Async("${url}");`;

      return `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        using var client = new HttpClient();
        
        try
        {
${csharpHeaders}
            
${csharpBody}
            
            response.EnsureSuccessStatusCode();
            var responseBody = await response.Content.ReadAsStringAsync();
            
            Console.WriteLine($"Status: {response.StatusCode}");
            Console.WriteLine($"Response: {responseBody}");
        }
        catch (HttpRequestException e)
        {
            Console.WriteLine($"Error: {e.Message}");
        }
    }
}`;

    case "go":
      const goHeaders = enabledHeaders
        .map((h) => `    req.Header.Set("${h.key}", "${h.value}")`)
        .join("\n");
      const goBody =
        body && ["POST", "PUT", "PATCH"].includes(method)
          ? `strings.NewReader(${JSON.stringify(body)})`
          : "nil";

      return `package main

import (
    "fmt"
    "io"
    "net/http"
    "strings"
)

func main() {
    client := &http.Client{}
    
    req, err := http.NewRequest("${method}", "${url}", ${goBody})
    if err != nil {
        fmt.Printf("Error creating request: %v\\n", err)
        return
    }
    
${goHeaders}
    
    resp, err := client.Do(req)
    if err != nil {
        fmt.Printf("Error making request: %v\\n", err)
        return
    }
    defer resp.Body.Close()
    
    body, err := io.ReadAll(resp.Body)
    if err != nil {
        fmt.Printf("Error reading response: %v\\n", err)
        return
    }
    
    fmt.Printf("Status: %s\\n", resp.Status)
    fmt.Printf("Response: %s\\n", string(body))
}`;

    default:
      return `// Code generation for ${language} not implemented yet`;
  }
};

export const encodeBase64 = (str: string): string => {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }),
  );
};

export const decodeBase64 = (str: string): string => {
  try {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
  } catch {
    return "";
  }
};

export const prettifyJson = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {});
};

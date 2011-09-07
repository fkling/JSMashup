// This file was autogenerated by ../../../lib/google_closure/closure/bin/build/depswriter.py.
// Please do not edit.
goog.addDependency('../../../mide/core/Component.js', ['mide.core.Component', 'mide.core.Component.Events'], ['goog.array', 'goog.dom', 'goog.object', 'goog.pubsub.PubSub', 'mide.core.OperationManager', 'mide.ui.ConfigurationDialog', 'mide.util.OptionMap']);
goog.addDependency('../../../mide/core/ComponentDescriptor.js', ['mide.core.ComponentDescriptor'], ['goog.array', 'goog.string', 'mide.core.Component', 'mide.parser']);
goog.addDependency('../../../mide/core/Composition.js', ['mide.core.Composition'], ['goog.events.EventTarget', 'goog.pubsub.PubSub']);
goog.addDependency('../../../mide/core/OperationManager.js', ['mide.core.OperationManager'], ['goog.array']);
goog.addDependency('../../../mide/core/Session.js', ['mide.config.session', 'mide.core.Session'], ['goog.net.Cookies', 'goog.object', 'goog.ui.IdGenerator']);
goog.addDependency('../../../mide/core/component/Event.js', ['mide.core.Event'], []);
goog.addDependency('../../../mide/core/component/Operation.js', ['mide.core.Operation'], []);
goog.addDependency('../../../mide/core/component/Parameter.js', ['mide.core.Parameter'], []);
goog.addDependency('../../../mide/core/component/Request.js', ['mide.core.Request'], []);
goog.addDependency('../../../mide/core/composition/Connection.js', ['mide.core.composition.Connection'], []);
goog.addDependency('../../../mide/core/net.js', ['mide.config.net', 'mide.core.net'], ['goog.Uri', 'goog.events', 'goog.net.XhrIo', 'goog.net.XhrIoPool', 'goog.object', 'goog.uri.utils']);
goog.addDependency('../../../mide/core/parser.js', ['mide.parser'], ['goog.dom.xml']);
goog.addDependency('../../../mide/mapper/ComponentMapper.js', ['mide.mapper.ComponentMapper'], ['mide.core.Event', 'mide.core.Operation', 'mide.core.Parameter']);
goog.addDependency('../../../mide/mapper/CompositionMapper.js', ['mide.mapper.CompositionMapper'], ['mide.core.Composition', 'mide.core.composition.Connection']);
goog.addDependency('../../../mide/mapper/EMDLMapper.js', ['mide.mapper.EMDLMapper'], ['goog.array', 'mide.mapper.ComponentMapper', 'mide.parser']);
goog.addDependency('../../../mide/mapper/JSONMapper.js', ['mide.mapper.JSONMapper'], ['goog.json', 'mide.mapper.CompositionMapper']);
goog.addDependency('../../../mide/mashupIDE.js', ['MashupIDE'], ['goog.array', 'goog.object', 'goog.ui.Component', 'mide.core.Session', 'mide.core.registry.ServerRegistry']);
goog.addDependency('../../../mide/module/moduleloader.js', ['mide.module.ModuleLoader'], ['goog.module.ModuleLoader']);
goog.addDependency('../../../mide/module/modulemanager.js', ['mide.module.ModuleManager'], ['goog.module.ModuleManager', 'mide.module.ModuleLoader']);
goog.addDependency('../../../mide/processor/DataProcessor.js', ['mide.processor.DataProcessor'], ['goog.array']);
goog.addDependency('../../../mide/processor/JsonProcessorProvider.js', ['mide.processor.JsonProcessorProvider'], ['mide.processor.ProcessorProvider']);
goog.addDependency('../../../mide/processor/ProcessorManager.js', ['mide.processor.ProcessorManager'], ['goog.array']);
goog.addDependency('../../../mide/processor/ProcessorProvider.js', ['mide.processor.ProcessorProvider'], ['mide.processor.ProcessorManager']);
goog.addDependency('../../../mide/processor/ServiceCall.js', ['org.reseval.processor.ServiceCall'], ['goog.array', 'goog.dom', 'goog.events', 'mide.core.Component', 'mide.core.Composition', 'mide.core.Session', 'mide.core.net', 'mide.processor.DataProcessor']);
goog.addDependency('../../../mide/registry/base_registry.js', ['mide.config.registry', 'mide.core.registry', 'mide.core.registry.BaseRegistry'], []);
goog.addDependency('../../../mide/registry/localstorage_registry.js', ['mide.registry.LocalstorageRegistry'], ['goog.array', 'goog.storage.mechanism.HTML5LocalStorage', 'mide.Component', 'mide.registry.BaseRegistry']);
goog.addDependency('../../../mide/registry/serverregistry.js', ['mide.core.registry.ServerRegistry'], ['goog.array', 'goog.json', 'goog.object', 'goog.uri.utils', 'mide.core.ComponentDescriptor', 'mide.core.net', 'mide.core.registry.BaseRegistry']);
goog.addDependency('../../../mide/ui/configuration_dialog.js', ['mide.ui.ConfigurationDialog'], ['goog.events', 'goog.object', 'goog.ui.Component', 'mide.ui.input.BaseInput', 'mide.ui.input.InputFactory', 'mide.util.OptionMap']);
goog.addDependency('../../../mide/ui/input/autocomplete.js', ['mide.ui.input.Autocomplete'], ['goog.array', 'goog.dom', 'goog.ui.AutoComplete', 'goog.ui.AutoComplete.InputHandler', 'goog.ui.AutoComplete.Renderer', 'mide.ui.input.BaseInput', 'mide.ui.input.autocomplete.Matcher']);
goog.addDependency('../../../mide/ui/input/autocomplete/matcher.js', ['mide.ui.input.autocomplete.Matcher'], ['goog.ui.AutoComplete.RemoteArrayMatcher', 'goog.uri.utils', 'mide.core.net']);
goog.addDependency('../../../mide/ui/input/base_input.js', ['mide.ui.input.BaseInput'], ['goog.dom', 'goog.events.EventHandler', 'goog.events.EventTarget', 'mide.util.OptionMap']);
goog.addDependency('../../../mide/ui/input/dropdown.js', ['mide.ui.input.Dropdown'], ['goog.dom', 'mide.ui.input.BaseInput']);
goog.addDependency('../../../mide/ui/input/inputfactory.js', ['mide.ui.input.InputFactory'], ['goog.dom', 'mide.module.ModuleManager', 'mide.ui.input.Autocomplete', 'mide.ui.input.Dropdown', 'mide.ui.input.ProxyInput']);
goog.addDependency('../../../mide/ui/input/proxyinput.js', ['mide.ui.input.ProxyInput'], ['goog.object', 'mide.ui.input.BaseInput', 'mide.ui.input.TextInput']);
goog.addDependency('../../../mide/ui/input/textinput.js', ['mide.ui.input.TextInput'], ['goog.dom', 'mide.ui.input.BaseInput']);
goog.addDependency('../../../mide/util/optionmap.js', ['mide.util.OptionMap'], ['goog.object']);

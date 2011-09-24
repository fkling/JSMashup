// This file was autogenerated by ../../../lib/google_closure/closure/bin/build/depswriter.py.
// Please do not edit.
goog.addDependency('../../../jsm.core/Component.js', ['jsm.core.Component', 'jsm.core.Component.Events'], ['goog.array', 'goog.dom', 'goog.object', 'goog.pubsub.PubSub', 'jsm.core.OperationManager', 'jsm.ui.ConfigurationDialog', 'jsm.util.OptionMap']);
goog.addDependency('../../../jsm.core/ComponentDescriptor.js', ['jsm.core.ComponentDescriptor'], ['goog.array', 'goog.string', 'jsm.core.Component', 'jsm.parser']);
goog.addDependency('../../../jsm.core/Composition.js', ['jsm.core.Composition'], ['goog.pubsub.PubSub']);
goog.addDependency('../../../jsm.core/OperationManager.js', ['jsm.core.OperationManager'], ['goog.array']);
goog.addDependency('../../../jsm.core/Session.js', ['jsm.config.session', 'jsm.core.Session'], ['goog.net.Cookies', 'goog.object', 'goog.ui.IdGenerator']);
goog.addDependency('../../../jsm.core/component/Event.js', ['jsm.core.Event'], []);
goog.addDependency('../../../jsm.core/component/Operation.js', ['jsm.core.Operation'], []);
goog.addDependency('../../../jsm.core/component/Parameter.js', ['jsm.core.Parameter'], []);
goog.addDependency('../../../jsm.core/composition/ArgumentMapper.js', ['jsm.core.ArgumentMapper'], []);
goog.addDependency('../../../jsm.core/composition/Connection.js', ['jsm.core.composition.Connection'], []);
goog.addDependency('../../../jsm.core/composition/DataTypeMapper.js', ['jsm.core.DataTypeMapper'], ['goog.array', 'goog.object']);
goog.addDependency('../../../jsm.core/net.js', ['jsm.config.net', 'jsm.core.net'], ['goog.Uri', 'goog.events', 'goog.net.XhrIo', 'goog.net.XhrIoPool', 'goog.object', 'goog.uri.utils']);
goog.addDependency('../../../jsm.core/parser.js', ['jsm.parser'], ['goog.dom.xml']);
goog.addDependency('../../../jsm.mapper/ComponentMapper.js', ['jsm.mapper.ComponentMapper'], ['jsm.core.Event', 'jsm.core.Operation', 'jsm.core.Parameter']);
goog.addDependency('../../../jsm.mapper/CompositionMapper.js', ['jsm.mapper.CompositionMapper'], ['jsm.core.Composition', 'jsm.core.composition.Connection']);
goog.addDependency('../../../jsm.mapper/EMDLMapper.js', ['jsm.mapper.EMDLMapper'], ['goog.array', 'goog.dom.xml', 'jsm.mapper.ComponentMapper', 'jsm.parser']);
goog.addDependency('../../../jsm.mapper/JSONMapper.js', ['jsm.mapper.JSONMapper'], ['goog.json', 'jsm.mapper.CompositionMapper']);
goog.addDependency('../../../jsm.mashupIDE.js', ['MashupIDE'], ['goog.array', 'goog.object', 'goog.ui.Component', 'jsm.core.Composition', 'jsm.core.Session', 'jsm.core.registry.ServerRegistry']);
goog.addDependency('../../../jsm.module/moduleloader.js', ['jsm.module.ModuleLoader'], ['goog.module.ModuleLoader']);
goog.addDependency('../../../jsm.module/modulemanager.js', ['jsm.module.ModuleManager'], ['goog.module.ModuleManager', 'jsm.module.ModuleLoader']);
goog.addDependency('../../../jsm.processor/DataProcessor.js', ['jsm.processor.DataProcessor'], ['goog.array']);
goog.addDependency('../../../jsm.processor/DomainConceptMapper.js', ['org.reseval.processor.DomainConceptMapper'], ['goog.array', 'goog.dom', 'goog.events', 'jsm.core.Component', 'jsm.core.Composition', 'jsm.core.Session', 'jsm.core.net', 'jsm.processor.DataProcessor']);
goog.addDependency('../../../jsm.processor/JsonProcessorProvider.js', ['jsm.processor.JsonProcessorProvider'], ['jsm.processor.ProcessorProvider']);
goog.addDependency('../../../jsm.processor/ProcessorManager.js', ['jsm.processor.ProcessorManager'], ['goog.array']);
goog.addDependency('../../../jsm.processor/ProcessorProvider.js', ['jsm.processor.ProcessorProvider'], ['jsm.processor.ProcessorManager']);
goog.addDependency('../../../jsm.processor/ServiceCall.js', ['org.reseval.processor.ServiceCall'], ['goog.array', 'goog.dom', 'goog.events', 'jsm.core.Component', 'jsm.core.Composition', 'jsm.core.Session', 'jsm.core.net', 'jsm.processor.DataProcessor', 'jsm.util.OptionMap']);
goog.addDependency('../../../jsm.registry/base_registry.js', ['jsm.config.registry', 'jsm.core.registry', 'jsm.core.registry.BaseRegistry'], []);
goog.addDependency('../../../jsm.registry/localstorage_registry.js', ['jsm.registry.LocalstorageRegistry'], ['goog.array', 'goog.storage.mechanism.HTML5LocalStorage', 'jsm.Component', 'jsm.registry.BaseRegistry']);
goog.addDependency('../../../jsm.registry/serverregistry.js', ['jsm.core.registry.ServerRegistry'], ['goog.array', 'goog.json', 'goog.object', 'goog.uri.utils', 'jsm.core.ComponentDescriptor', 'jsm.core.net', 'jsm.core.registry.BaseRegistry']);
goog.addDependency('../../../jsm.ui/configuration_dialog.js', ['jsm.ui.ConfigurationDialog'], ['goog.events', 'goog.object', 'goog.ui.Component', 'jsm.ui.input.BaseInput', 'jsm.ui.input.InputFactory', 'jsm.util.OptionMap']);
goog.addDependency('../../../jsm.ui/input/autocomplete.js', ['jsm.ui.input.Autocomplete'], ['goog.array', 'goog.dom', 'goog.ui.AutoComplete', 'goog.ui.AutoComplete.InputHandler', 'goog.ui.AutoComplete.Renderer', 'jsm.ui.input.BaseInput', 'jsm.ui.input.autocomplete.Matcher']);
goog.addDependency('../../../jsm.ui/input/autocomplete/matcher.js', ['jsm.ui.input.autocomplete.Matcher'], ['goog.ui.AutoComplete.RemoteArrayMatcher', 'goog.uri.utils', 'jsm.core.net']);
goog.addDependency('../../../jsm.ui/input/base_input.js', ['jsm.ui.input.BaseInput'], ['goog.dom', 'goog.events.EventHandler', 'goog.events.EventTarget', 'jsm.util.OptionMap']);
goog.addDependency('../../../jsm.ui/input/datepicker.js', ['jsm.ui.input.Datepicker'], ['goog.dom', 'jsm.ui.input.BaseInput']);
goog.addDependency('../../../jsm.ui/input/dropdown.js', ['jsm.ui.input.Dropdown'], ['goog.dom', 'jsm.ui.input.BaseInput']);
goog.addDependency('../../../jsm.ui/input/inputfactory.js', ['jsm.ui.input.InputFactory'], ['goog.dom', 'jsm.module.ModuleManager', 'jsm.ui.input.Autocomplete', 'jsm.ui.input.Dropdown', 'jsm.ui.input.ProxyInput']);
goog.addDependency('../../../jsm.ui/input/proxyinput.js', ['jsm.ui.input.ProxyInput'], ['goog.object', 'jsm.ui.input.BaseInput', 'jsm.ui.input.TextInput']);
goog.addDependency('../../../jsm.ui/input/textinput.js', ['jsm.ui.input.TextInput'], ['goog.dom', 'jsm.ui.input.BaseInput']);
goog.addDependency('../../../jsm.util/optionmap.js', ['jsm.util.OptionMap'], ['goog.object']);
goog.addDependency('../../../jsm.validator/AbstractDomainValidator.js', ['jsm.validator.AbstractDomainValidator'], []);
goog.addDependency('../../../jsm.validator/StaticDomainValidator.js', ['jsm.validator.StaticDomainValidator'], ['goog.array']);